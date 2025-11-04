"""
WombGuard Chatbot Engine
Integrates Sentence Transformers + BM25 for hybrid retrieval-based QA
"""

import os
import pickle
import numpy as np
import logging
from pathlib import Path
from sentence_transformers import SentenceTransformer, util
from rank_bm25 import BM25Okapi

logger = logging.getLogger(__name__)


class WombGuardChatbot:
    """
    Hybrid chatbot using Sentence Transformers + BM25
    Supports 3 specialized models: general, medical, qa
    """

    def __init__(self, models_dir: str = None):
        """
        Initializing chatbot with trained models

        Args:
        models_dir: Path to models directory (default: ../wombguardbot_models)
        """
        self.models_dir = models_dir or os.path.join(
            os.path.dirname(__file__), '..', 'wombguardbot_models'
        )
        self.models = {}
        self.bm25_index = None
        self.embeddings_ensemble = None
        self.qa_pairs = []
        self._load_models()
        self._load_indices()

    def _load_models(self):
        """Loading all three Sentence Transformer models"""
        model_names = [
            'model_general_finetuned',
            'model_medical_finetuned',
            'model_qa_finetuned']
        for model_name in model_names:
            try:
                model_path = os.path.join(self.models_dir, model_name)
                if os.path.exists(model_path):
                    self.models[model_name] = SentenceTransformer(model_path)
                    logger.info(f"Loaded {model_name}")
                else:
                    logger.warning(f" Model not found: {model_path}")
            except Exception as e:
                logger.error(f"Failed to load {model_name}: {e}")
    def _load_indices(self):
        """Loading BM25 index, embeddings, and Q&A pairs"""
        try:
            bm25_path = os.path.join(self.models_dir, 'bm25_index.pkl')
            if os.path.exists(bm25_path):
                with open(bm25_path, 'rb') as f:
                    bm25_data = pickle.load(f)

                # Extract BM25 index and Q&A pairs
                if isinstance(bm25_data, dict):
                    self.bm25_index = bm25_data.get('bm25_index')
                    self.qa_pairs = list(zip(
                        bm25_data.get('questions', []),
                        bm25_data.get('answers', [])
                    ))
                    logger.info(f"Loaded BM25 index with {len(self.qa_pairs)} Q&A pairs")
                else:
                    self.bm25_index = bm25_data
                    logger.info("Loaded BM25 index")
        except Exception as e:
            logger.error(f"Failed to load BM25 index: {e}")

        try:
            embeddings_path = os.path.join(self.models_dir, 'embeddings_ensemble.npy')
            if os.path.exists(embeddings_path):
                self.embeddings_ensemble = np.load(embeddings_path)
                logger.info(
                    f"Loaded embeddings ensemble with shape {self.embeddings_ensemble.shape}")
        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}")
    def _select_best_model(self, query: str) -> str:
        """
        Select the best model based on query characteristics

        Medical keywords trigger medical model
        Q&A format triggers QA model
        Otherwise use general model
        """
        # medical keywords for better detection 
        medical_keywords = [
            # Critical conditions & emergencies
            'emergency', 'urgent', 'severe', 'serious', 'critical',

            # Vital signs & measurements
            'blood pressure', 'hypertension', 'pressure',

            # Pregnancy complications
            'preeclampsia', 'eclampsia', 'hellp', 'cholestasis',
            'gestational', 'diabetes', 'hyperemesis',

            # Placental & uterine issues
            'placenta', 'placenta previa', 'placental abruption',
            'cord', 'cord prolapse', 'amniotic', 'oligohydramnios',
            'polyhydramnios', 'cervical', 'incompetent cervix',

            # Pregnancy loss & complications
            'miscarriage', 'stillbirth', 'ectopic', 'abortion',

            # Delivery complications
            'premature', 'preterm', 'breech', 'cesarean', 'c-section',
            'twins', 'multiples', 'shoulder dystocia',

            # Labor & delivery
            'labor', 'contractions', 'delivery', 'induction', 'induce',
            'dilation', 'effacement', 'epidural', 'episiotomy',
            'rupture', 'water break', 'mucus plug',

            # Symptoms (general)
            'symptom', 'pain', 'bleeding', 'spotting', 'discharge',
            'fever', 'infection', 'nausea', 'vomiting', 'cramps',
            'swelling', 'edema', 'headache', 'dizziness', 'dizzy',
            'fatigue', 'tired', 'weak', 'faint',

            # Vision & neurological
            'vision', 'blurred', 'seizure', 'convulsion',

            # Digestive symptoms
            'heartburn', 'constipation', 'diarrhea', 'dehydration',

            # Blood & lab tests
            'anemia', 'protein', 'urine', 'glucose', 'blood sugar',

            # Immunology & infections
            'rh', 'rh negative', 'antibodies', 'immunization',
            'gbs', 'strep', 'streptococcus', 'uti',

            # Infectious diseases
            'hiv', 'aids', 'hepatitis', 'std', 'sti',
            'toxoplasmosis', 'rubella', 'zika', 'listeria',
            'cytomegalovirus', 'cmv', 'herpes', 'syphilis',

            # Medical procedures & tests
            'ultrasound', 'scan', 'screening', 'test', 'monitor',
            'vaccine', 'medication', 'surgery', 'procedure',

            # Healthcare providers & facilities
            'doctor', 'hospital', 'clinic', 'midwife', 'obstetrician',

            # Fetal development
            'fetal', 'fetus', 'embryo', 'birth defect', 'congenital',
            'genetic', 'chromosomal', 'down syndrome', 'neural tube',

            # Postpartum
            'postpartum', 'postnatal', 'mastitis', 'engorgement',

            # General medical terms
            'risk', 'high-risk', 'complication', 'abnormal', 'trimester'
        ]

        query_lower = query.lower()

        # Check for medical keywords 
        if any(keyword in query_lower for keyword in medical_keywords):
            return 'model_medical_finetuned'

        # Check for Q&A format (question mark) - but not if medical keywords
        # present
        if '?' in query:
            return 'model_qa_finetuned'

        # Default to general
        return 'model_general_finetuned'
    def generate_response(self, user_message: str) -> dict:
        """
        Generate chatbot response using hybrid retrieval

        Args:
        user_message: User's input message

        Returns:
        dict with response, confidence, and model used
        """
        if not self.models:
            return {
                "response": "Chatbot models not loaded. Please check server logs.",
                "confidence": 0.0,
                "model_used": "none"
            }

        try:
            # Selecting best model
            model_name = self._select_best_model(user_message)
            model = self.models.get(model_name)

            if not model:
                return {
                    "response": "Selected model not available.",
                    "confidence": 0.0,
                    "model_used": model_name
                }

            # Encoding user message
            query_embedding = model.encode(user_message, convert_to_numpy=True)

            # Semantic similarity search (if embeddings available)
            response_text, confidence = self._semantic_search(query_embedding, model)

            # BM25 fallback (if semantic search fails)
            if not response_text and self.bm25_index:
                response_text, confidence = self._bm25_search(user_message)

            # Default response if no match found
            if not response_text:
                response_text = self._generate_default_response(user_message, model_name)
                confidence = 0.0

            return {
                "response": response_text,
                "confidence": round(confidence, 2),
                "model_used": model_name
            }

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "response": f"I encountered an error processing your message. Please try again.",
                "confidence": 0.0,
                "model_used": "error"}

    def _semantic_search(self, query_embedding, model) -> tuple:
        """Search using semantic similarity and return actual answer with confidence"""
        try:
            if self.embeddings_ensemble is None or len(self.embeddings_ensemble) == 0:
                return None, 0.0

            # Computing similarity scores using util.pytorch_cos_sim
            # query_embedding is numpy array, converting to proper format
            similarities = util.pytorch_cos_sim(
                query_embedding, self.embeddings_ensemble)[0]

            # Getting top match
            top_idx = np.argmax(similarities.cpu().numpy())
            top_score = float(similarities[top_idx].item())

            # Returning actual answer if confidence is high enough, threshold 0.7
            if top_score > 0.7 and len(self.qa_pairs) > top_idx:
                question, answer = self.qa_pairs[top_idx]
                logger.info(
                    f"Semantic match: Q: {question[:50]}... (score: {top_score:.2f})")
                return answer, top_score

            return None, 0.0
        except Exception as e:
            logger.warning(f"Semantic search failed: {e}")
            return None, 0.0
    def _bm25_search(self, query: str) -> tuple:
        """Searching using BM25 and returning actual answer with confidence"""
        try:
            if not self.bm25_index or not self.qa_pairs:
                return None, 0.0

            # Tokenizing query
            query_tokens = query.lower().split()

            # Handling both BM25Okapi object and dict formats
            if isinstance(self.bm25_index, dict):
                # If it's a dict, it might be a serialized format
                return None, 0.0

            # Getting BM25 scores
            scores = self.bm25_index.get_scores(query_tokens)

            if len(scores) > 0:
                top_idx = np.argmax(scores)
                top_score = float(scores[top_idx])

                # Normalizing BM25 score to 0-1 range (BM25 scores can be > 1), typical
                # max BM25 score ~20
                normalized_score = min(top_score / 20.0, 1.0)

                if top_score > 0 and len(self.qa_pairs) > top_idx:
                    question, answer = self.qa_pairs[top_idx]
                    logger.info(f"BM25 match: Q: {question[:50]}... (score: {top_score:.2f})")
                    return answer, normalized_score

            return None, 0.0
        except Exception as e:
            logger.warning(f"BM25 search failed: {e}")
            return None, 0.0

    def _generate_default_response(
            self,
            user_message: str,
            model_name: str) -> str:
        """Generating contextual default response"""
        responses = {
            'model_medical_finetuned': (
                "I understand you have a medical question about pregnancy. "
                "For specific medical concerns, please consult with your healthcare provider. "
                "I'm here to provide general information and support."
            ),
            'model_qa_finetuned': (
                "That's a great question about pregnancy health. "
                "While I don't have a specific answer in my knowledge base, "
                "I recommend discussing this with your healthcare provider for personalized advice."
            ),
            'model_general_finetuned': (
                "Thank you for reaching out! I'm WombGuardBot, your pregnancy health assistant. "
                "I'm here to provide support and information about pregnancy wellness. "
                "How can I help you today?"
            )
        }
        return responses.get(model_name, responses['model_general_finetuned'])

    def is_ready(self) -> bool:
        """Check if chatbot is ready to use"""
        return len(self.models) > 0


# Global chatbot instance
_chatbot_instance = None


def get_chatbot() -> WombGuardChatbot:
    """Get or create chatbot instance"""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = WombGuardChatbot()
    return _chatbot_instance
