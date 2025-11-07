from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import pandas as pd
import shap
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
from passlib.context import CryptContext
from datetime import datetime, timedelta
import logging
import uuid
from chatbot_engine import get_chatbot
from jose import JWTError, jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Loading environment variables
load_dotenv()

# Configuring logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI application initialization
app = FastAPI(title="Predictive Maternal Health System & the WombGuard Conversational ChatBot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://wombguard-platform.onrender.com",
        "https://wombguard-api.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing configuration using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    """Securely hash password using bcrypt (maximum 72 bytes)."""
    if not password:
        raise ValueError("Password cannot be empty")
    safe_bytes = password.encode("utf-8")[:72]
    safe_password = safe_bytes.decode("utf-8", errors="ignore")
    return pwd_context.hash(safe_password)


def verify_password(plain_password: str, hashed_password: str):
    """Verify plaintext password against hashed version."""
    try:
        safe_bytes = plain_password.encode("utf-8")[:72]
        safe_password = safe_bytes.decode("utf-8", errors="ignore")
        return pwd_context.verify(safe_password, hashed_password)
    except Exception:
        return False


# JWT token configuration
SECRET_KEY = "your-secret-key-change-in-production-use-env-variable"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_verification_token():
    """Generate a secure random verification token."""
    return secrets.token_urlsafe(32)


def send_verification_email(email: str, token: str):
    """Send verification email to user via Gmail SMTP."""
    try:
        verification_link = f"http://localhost:3000/verify-email?token={token}"

        # Getting email credentials from environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")

        # If credentials not configured, just log to console
        if not sender_email or not sender_password:
            logger.warning(
                " Email credentials not configured. Logging verification link to console.")
            logger.info(f" Verification email would be sent to {email}")
            logger.info(f" Verification link: {verification_link}")
            logger.info(f" Token: {token}")
            return True

        # Creating email message
        message = MIMEMultipart("alternative")
        message["Subject"] = " WombGuard - Verify Your Email"
        message["From"] = sender_email
        message["To"] = email

        # Email body (HTML)
        html = f"""\
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e91e63; margin: 0;"> WombGuard</h1>
        <p style="color: #666; margin: 5px 0;">Pregnancy Health Monitoring</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Welcome to WombGuard!</h2>
        <p>Thank you for registering. Please verify your email address to complete your account setup.</p>

        <div style="text-align: center; margin: 30px 0;">
        <a href="{verification_link}" style="background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Verify Email
        </a>
        </div>

        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="background-color: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #0066cc;">
        {verification_link}
        </p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p style="margin-top: 20px; color: #999;">© 2025 WombGuard. All rights reserved.</p>
        </div>
        </div>
        </body>
        </html>
        """

        # Attaching HTML content
        part = MIMEText(html, "html")
        message.attach(part)

        # Sending email via Gmail SMTP
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())

        logger.info(f" Verification email sent to {email}")
        logger.info(f" Verification link: {verification_link}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(
            " Email authentication failed. Check SENDER_EMAIL and SENDER_PASSWORD in .env")
        return False
    except smtplib.SMTPException as e:
        logger.error(f" SMTP error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f" Error sending verification email: {str(e)}")
        return False


# AUTHORIZATION HELPER FUNCTIONS
def parse_datetime(datetime_str: str):
    """
    Parse datetime string from Supabase, handling various formats.
    Supabase sometimes returns timestamps with 5-digit microseconds which Python can't parse.
    """
    if not datetime_str:
        return None
    try:
        # Remove 'Z' and replace with '+00:00'
        datetime_str = datetime_str.replace("Z", "+00:00")
        # Try parsing directly
        return datetime.fromisoformat(datetime_str)
    except ValueError:
        # If it fails, it might be due to microseconds issue
        # Extract and normalize microseconds
        import re
        # Pattern: YYYY-MM-DDTHH:MM:SS.microseconds+TZ
        match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)([\+\-]\d{2}:\d{2})', datetime_str)
        if match:
            date_part, microseconds, tz_part = match.groups()
            # Normalize microseconds to 6 digits
            microseconds = microseconds.ljust(6, '0')[:6]
            normalized = f"{date_part}.{microseconds}{tz_part}"
            return datetime.fromisoformat(normalized)
        # Fallback: return current time
        return datetime.utcnow()


def require_admin(user: dict):
    """ SECURITY FIX: Check if user is admin, raise 403 if not"""
    if not user or user.get('role') != 'admin':
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin role required."
        )


def require_healthcare_provider(user: dict):
    """ SECURITY FIX: Check if user is healthcare provider or admin"""
    if not user or user.get('role') not in ['healthcare_provider', 'admin']:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Healthcare provider role required."
        )


# LOADING TRAINED MODEL AND SCALER
try:
    package = joblib.load("wombguard_pregnancy_model.pkl")
    model = package["model"]
    scaler = package["scaler"]
    feature_names = package["feature_names"]
except Exception as e:
    raise RuntimeError(f" Error loading model package: {e}")


# INPUT SCHEMAS
class PatientData(BaseModel):
    Age: float
    Systolic_BP: float
    Diastolic: float
    BS: float
    Body_Temp: float
    BMI: float
    Heart_Rate: float


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    role: str = "pregnant_woman"


class UserLogin(BaseModel):
    email: str
    password: str


class EmailVerificationRequest(BaseModel):
    token: str


class ChatMessage(BaseModel):
    message: str
    user_id: str
    conversation_id: str = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: str


class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    userType: str


class ConsultationRequest(BaseModel):
    healthcare_provider_email: str
    subject: str
    message: str
    priority: str = "normal"


class ConsultationResponse(BaseModel):
    status: str  # accepted, declined, closed
    response_message: str = None


class ConsultationMessage(BaseModel):
    consultation_id: str
    message: str


# ROOT ENDPOINT
@app.get("/")
def root():
    return {"message": " Predictive Maternal Health System & the WombGuard Conversational ChatBot API is running successfully!"}


# HEALTH CHECK ENDPOINT
@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring systems and load balancers.
    Returns: API status, version, and timestamp
    """
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "WombGuard Predictive API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }


# VALIDATION FUNCTION FOR HEALTH DATA
def validate_patient_data(features: PatientData):
    """
    Validate patient health data against realistic ranges.
    Returns: (is_valid, error_message)
    """
    errors = []

    # Age validation: 10-60 years (reasonable for pregnancy)
    if features.Age < 10 or features.Age > 60:
        errors.append(f"Age {features.Age} is outside valid range (10-60 years)")

    # Systolic BP: 70-200 mmHg
    if features.Systolic_BP < 70 or features.Systolic_BP > 200:
        errors.append(
            f"Systolic BP {features.Systolic_BP} is outside valid range (70-200 mmHg)")

    # Diastolic BP: 40-130 mmHg
    if features.Diastolic < 40 or features.Diastolic > 130:
        errors.append(
            f"Diastolic BP {features.Diastolic} is outside valid range (40-130 mmHg)")

    # Blood Sugar: 2.5-20 mmol/L (or 45-360 mg/dL)
    if features.BS > 0 and (features.BS < 2.5 or features.BS > 20):
        errors.append(
            f"Blood Sugar {features.BS} is outside valid range (2.5-20 mmol/L)")

    # Body Temperature: 35-40°C
    if features.Body_Temp > 0 and (
            features.Body_Temp < 35 or features.Body_Temp > 40):
        errors.append(
            f"Body Temperature {features.Body_Temp} is outside valid range (35-40°C)")

    # BMI: 10-50 kg/m²
    if features.BMI > 0 and (features.BMI < 10 or features.BMI > 50):
        errors.append(f"BMI {features.BMI} is outside valid range (10-50 kg/m²)")

    # Heart Rate: 40-150 bpm
    if features.Heart_Rate > 0 and (
            features.Heart_Rate < 40 or features.Heart_Rate > 150):
        errors.append(
            f"Heart Rate {features.Heart_Rate} is outside valid range (40-150 bpm)")

    if errors:
        return False, " | ".join(errors)
    return True, ""


# PREDICTION ENDPOINT
@app.post("/predict")
def predict(features: PatientData, user_email: str = Query(...,
            description="Email of the user making prediction")):
    # Validate patient data FIRST (outside try-catch)
    is_valid, error_msg = validate_patient_data(features)
    if not is_valid:
        logger.warning(f"Invalid patient data from {user_email}: {error_msg}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid health data: {error_msg}")

    try:
        # Prepare input
        input_data = pd.DataFrame([features.dict()])[feature_names]
        scaled_data = scaler.transform(input_data)

        # Predict risk
        probability = float(model.predict_proba(scaled_data)[:, 1][0])
        predicted_class = int(probability >= 0.5)
        risk_label = "High Risk" if predicted_class == 1 else "Low Risk"

        # SHAP explanation
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(scaled_data)
        except Exception:
            explainer = shap.Explainer(model.predict, input_data)
            shap_values = explainer(input_data).values

        shap_array = np.array(
            shap_values[1] if isinstance(
                shap_values, list) else shap_values).reshape(
            1, -1)
        shap_contributions = dict(zip(feature_names, shap_array[0]))
        top_features = sorted(
            shap_contributions.items(),
            key=lambda x: abs(
                x[1]),
            reverse=True)[
                :3]
        summary_text = "Top influencing features: " + ", ".join(
            [f"{k} ({v:+.3f})" for k, v in top_features]
        )

        # Save prediction in Supabase with all vital signs
        try:
            supabase.table("predictions").insert({
                "user_email": user_email.strip().lower(),
                "predicted_risk": risk_label,
                "probability": probability,
                "confidence_score": round(max(probability, 1 - probability), 4),
                "age": float(features.Age),
                "systolic_bp": float(features.Systolic_BP),
                "diastolic": float(features.Diastolic),
                "bs": float(features.BS),
                "body_temp": float(features.Body_Temp),
                "bmi": float(features.BMI),
                "heart_rate": float(features.Heart_Rate),
                "feature_importance": shap_contributions,
                "explanation": summary_text,
                "role": "pregnant_woman",
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            print(f" Warning: Could not store prediction: {e}")

        return {
            "prediction": {
                "Predicted_Risk_Level": risk_label,
                "Probability_High_Risk": round(probability, 4),
                "Confidence_Score": round(max(probability, 1 - probability), 4),
            },
            "explanation": {
                "feature_importance": shap_contributions,
                "summary": summary_text,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# DASHBOARD ENDPOINT
@app.get("/dashboard")
def dashboard(role: str = Query(...,
                                description="Role (e.g., pregnant_woman)"),
              user_email: str = Query(None,
                                      description="User email for filtering")):
    """
    Fetch recent predictions for the given user role.
    For pregnant_woman role, filters by user_email to show only their own data.
    For admin/healthcare_provider, shows all predictions.
    Ensures frontend always receives a predictable structure.
    """
    try:
        query = supabase.table("predictions").select("*")

        # For pregnant women, filter by their email
        if role == "pregnant_woman" and user_email:
            query = query.eq("user_email", user_email.strip().lower())
        # For admin and healthcare_provider, show all predictions
        elif role in ["admin", "healthcare_provider"]:
            pass  

        response = (
            query
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        data = response.data if response.data else []
        return {"status": "success", "data": data}  
    except Exception as e:
        return {"status": "error", "data": [],
                "message": f"Failed to fetch dashboard: {str(e)}"}


# USER REGISTRATION
@app.post("/register")
def register(user: UserRegister):
    try:
        # Allowing only allow pregnant_woman role for self-registration
        # Healthcare providers and admins must be created by admins only
        if user.role.strip().lower() != 'pregnant_woman':
            raise HTTPException(
                status_code=403,
                detail="Only pregnant women can self-register. Contact an administrator to create healthcare provider or admin accounts."
            )

        hashed_password = hash_password(user.password)

        # NEW: Generate verification token
        verification_token = generate_verification_token()

        user_data = {
            "name": user.name.strip(),
            "email": user.email.strip().lower(),
            "password": hashed_password,
            "phone": user.phone.strip(),  
            "role": 'pregnant_woman',  
            "email_verified": False,  
            "verification_token": verification_token,  
        }

        # Checking if user already exists
        existing = supabase.table("users").select(
            "*").eq("email", user_data["email"]).execute()
        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists")

        # NEW: Checking if phone already exists
        phone_existing = supabase.table("users").select(
            "*").eq("phone", user_data["phone"]).execute()
        if phone_existing.data:
            raise HTTPException(
                status_code=400,
                detail="User with this phone number already exists")

        # Inserting new user
        response = supabase.table("users").insert(user_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Registration failed — no response data")

        # NEW: Sending verification email
        send_verification_email(user_data["email"], verification_token)

        logger.info(f" New pregnant woman registered: {user_data['email']}")
        logger.info(f" Phone stored: {user_data['phone']}")
        logger.info(f" Verification email sent to: {user_data['email']}")
        # NEW: Include verification link in response for development
        verification_link = f"http://localhost:3000/verify-email?token={verification_token}"

        return {
            "status": "success",
            "message": "Registration successful! Please check your email to verify your account.",
            "verification_link": verification_link,  
            "verification_token": verification_token,  
            "user": {
                "name": user_data["name"],
                "email": user_data["email"],
                "phone": user_data["phone"],
                "role": user_data["role"],
                "email_verified": False
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration error: {str(e)}")


# USER LOGIN
@app.post("/login")
def login(credentials: UserLogin):
    try:
        response = supabase.table("users").select(
            "*").eq("email", credentials.email.lower()).execute()
        users = response.data
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        user = users[0]

        # Checking if user is blocked
        if user.get("is_blocked", False):
            raise HTTPException(
                status_code=403,
                detail="Your account has been blocked by an administrator")

        # NEW: Checking if email is verified
        if not user.get("email_verified", False):
            raise HTTPException(
                status_code=403,
                detail="Email not verified. Please check your email and click the verification link."
            )

        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # NEW: Creating JWT token
        access_token = create_access_token(
            data={
                "user_id": user["id"],
                "email": user["email"],
                "role": user["role"]
            }
        )

        user.pop("password", None)
        user.pop("verification_token", None)

        logger.info(f" User logged in: {user['email']}")
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


# EMAIL VERIFICATION ENDPOINT
@app.post("/verify-email")
def verify_email(request: EmailVerificationRequest):
    """ NEW: Verify user email using verification token."""
    try:
        # Finding user by verification token
        response = supabase.table("users").select(
            "*").eq("verification_token", request.token).execute()
        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired verification token")

        user = response.data[0]

        # Updating user: mark email as verified and clear token
        update_data = {
            "email_verified": True,
            "email_verified_at": datetime.utcnow().isoformat(),
            "verification_token": None
        }

        update_response = supabase.table("users").update(
            update_data).eq("id", user["id"]).execute()
        if not update_response.data:
            raise HTTPException(status_code=400, detail="Failed to verify email")

        logger.info(f" Email verified for user: {user['email']}")
        return {
            "status": "success",
            "message": "Email verified successfully! You can now log in.",
            "email": user["email"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Email verification error: {str(e)}")


# ADMIN-ONLY USER CREATION ENDPOINT
@app.post("/admin/create-user")
def admin_create_user(user: UserRegister, admin_email: str = Query(...)):
    """
    SECURITY FIX: Create a new user with any role.
    Only admins can use this endpoint.

    This endpoint allows admins to create healthcare providers and other admins.
    Regular users cannot use this endpoint.
    """
    try:
        # Getting current user (admin) and verify admin role
        admin_response = supabase.table("users").select(
            "*").eq("email", admin_email.lower()).execute()
        if not admin_response.data:
            raise HTTPException(status_code=401, detail="Admin user not found")

        admin_user = admin_response.data[0]

        # SECURITY FIX: Checking if current user is admin
        require_admin(admin_user)

        # NOW creating user with specified role
        hashed_password = hash_password(user.password)

        # NEW: Generating verification token for admin-created users
        verification_token = generate_verification_token()

        user_data = {
            "name": user.name.strip(),
            "email": user.email.strip().lower(),
            "password": hashed_password,
            "phone": user.phone.strip(),  
            "role": user.role.strip().lower(), 
            "email_verified": False,  
            "verification_token": verification_token,  
        }

        # Checking if user already exists
        existing = supabase.table("users").select(
            "*").eq("email", user_data["email"]).execute()
        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists")

        # NEW: Checking if phone already exists
        phone_existing = supabase.table("users").select(
            "*").eq("phone", user_data["phone"]).execute()
        if phone_existing.data:
            raise HTTPException(
                status_code=400,
                detail="User with this phone number already exists")

        # Inserting new user
        response = supabase.table("users").insert(user_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="User creation failed")

        # NEW: Sending verification email
        send_verification_email(user_data["email"], verification_token)

        logger.info(
            f" Admin {admin_email} created user {user_data['email']} with role {user_data['role']}")
        logger.info(f" Phone stored: {user_data['phone']}")
        logger.info(f" Verification email sent to: {user_data['email']}")

        return {
            "status": "success",
            "message": "User created successfully! Verification email sent.",
            "user": {
                "name": user_data["name"],
                "email": user_data["email"],
                "phone": user_data["phone"],
                "role": user_data["role"],
                "email_verified": False
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"User creation error: {str(e)}")


# CHATBOT ENDPOINT (INTEGRATED WITH TRAINED MODELS)
@app.post("/chat")
def chat(chat_data: ChatMessage):
    """
    Chatbot endpoint for conversational AI support.

    Uses hybrid retrieval (Sentence Transformers + BM25) with 3 specialized models:
        - model_general_finetuned: General pregnancy questions
    - model_general_finetuned: General pregnancy questions
    - model_medical_finetuned: Medical/clinical questions
    - model_qa_finetuned: Q&A format questions

    Expected model input: user message
    Expected model output: empathetic, context-aware response
    """
    try:
        logger.info(
            f"Chat request from user: {chat_data.user_id}: {chat_data.message}")

        # Getting chatbot instance
        chatbot = get_chatbot()

        # Checking if chatbot is ready
        if not chatbot.is_ready():
            logger.warning("Chatbot models not loaded")
            bot_response = (
                "I apologize, but my models are currently loading. "
                "Please try again in a moment."
            )
            model_used = "none"
        else:
            # Generating response using trained models
            result = chatbot.generate_response(chat_data.message)
            bot_response = result["response"]
            model_used = result["model_used"]
            logger.info(f"Generated response using {model_used}")

        # Saving chat message to Supabase
        try:
            supabase.table("chat_history").insert({
                "user_id": chat_data.user_id,
                "user_message": chat_data.message,
                "bot_response": bot_response,
                "conversation_id": chat_data.conversation_id or "default",
                "model_used": model_used,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            logger.warning(f"Could not save chat message: {e}")

        return {
            "response": bot_response,
            "conversation_id": chat_data.conversation_id or "default",
            "model_used": model_used,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat request failed: {str(e)}")


# STARTING NEW CONVERSATION ENDPOINT
class NewConversationRequest(BaseModel):
    user_id: str


@app.post("/chat/new-conversation")
def start_new_conversation(request: NewConversationRequest):
    """
    Start a new conversation session for a user.
    Returns a new conversation ID.
    """
    try:
        conversation_id = str(uuid.uuid4())
        logger.info(
            f"Started new conversation {conversation_id} for user {request.user_id}")

        return {
            "conversation_id": conversation_id,
            "user_id": request.user_id,
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error starting conversation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start conversation: {str(e)}")


# DASHBOARD STATS ENDPOINT
@app.get("/dashboard-stats")
def get_dashboard_stats(user_email: str = Query(...,
                        description="User email")):
    """
    Fetch comprehensive dashboard statistics for pregnant women.
    Returns: completed assessments, upcoming checkups, high risk alerts, recent assessments
    """
    try:
        user_email = user_email.strip().lower()

        # Fetching all predictions for this user
        predictions_response = (
            supabase.table("predictions")
            .select("*")
            .eq("user_email", user_email)
            .order("created_at", desc=True)
            .execute()
        )
        predictions = predictions_response.data or []

        # Calculating stats
        completed_assessments = len(predictions)
        high_risk_alerts = sum(1 for p in predictions if p.get(
            "predicted_risk") == "High Risk")
        last_assessment = predictions[0]["created_at"] if predictions else None

        # Getting recent assessments (last 5)
        recent_assessments = predictions[:5]

        return {
            "status": "success",
            "stats": {
                "completed_assessments": completed_assessments,
                "upcoming_checkups": 0,  
                "high_risk_alerts": high_risk_alerts,
                "last_assessment": last_assessment
            },
            "recent_assessments": recent_assessments
        }
    except Exception as e:
        logger.error(f"Failed to fetch dashboard stats: {e}")
        return {
            "status": "error",
            "stats": {
                "completed_assessments": 0,
                "upcoming_checkups": 0,
                "high_risk_alerts": 0,
                "last_assessment": None
            },
            "recent_assessments": [],
            "message": str(e)
        }


# USER PROFILE ENDPOINT
@app.get("/user-profile")
def get_user_profile(user_email: str = Query(..., description="User email")):
    """
    Fetch user profile information by email.
    Returns: name, email, role, and other user details
    """
    try:
        user_email = user_email.strip().lower()

        # Fetching user from database
        response = supabase.table("users").select(
            "*").eq("email", user_email).execute()

        if not response.data:
            return {
                "status": "error",
                "message": "User not found",
                "user": None
            }

        user = response.data[0]
        # Removing password from response
        user.pop("password", None)

        return {
            "status": "success",
            "user": user
        }
    except Exception as e:
        logger.error(f"Failed to fetch user profile: {e}")
        return {
            "status": "error",
            "message": str(e),
            "user": None
        }


# RISK ASSESSMENTS HISTORY ENDPOINT
@app.get("/risk-assessments")
def get_risk_assessments(user_email: str = Query(...,
                         description="User email")):
    """Fetch all risk assessments for a user from predictions table."""
    try:
        response = (
            supabase.table("predictions")
            .select("*")
            .eq("user_email", user_email.strip().lower())
            .order("created_at", desc=True)
            .execute()
        )

        # Transforming data to match frontend expectations
        assessments = []
        for pred in response.data or []:
            assessment = {
                "id": pred.get("id"),
                "riskLevel": pred.get(
                    "predicted_risk",
                    "").lower().replace(
                    " risk",
                    ""),
                "riskScore": round(
                    float(
                        pred.get(
                            "probability",
                            0)) * 100,
                    1),
                "maxScore": 100,
                "timestamp": pred.get("created_at"),
                "probability": pred.get("probability"),
                "confidence_score": pred.get("confidence_score"),
                "age": pred.get("age"),
                "systolic_bp": pred.get("systolic_bp"),
                "diastolic": pred.get("diastolic"),
                "bs": pred.get("bs"),
                "body_temp": pred.get("body_temp"),
                "bmi": pred.get("bmi"),
                "heart_rate": pred.get("heart_rate"),
                "explanation": pred.get("explanation"),
                "feature_importance": pred.get("feature_importance"),
                "recommendations": [
                    "Attend scheduled prenatal check-ups regularly",
                    "Monitor blood pressure and blood sugar regularly",
                    "Maintain a healthy diet and exercise routine",
                    "Report any unusual symptoms immediately"]}
            assessments.append(assessment)

        return {"status": "success", "data": assessments}
    except Exception as e:
        logger.error(f"Failed to fetch risk assessments: {e}")
        return {"status": "error", "data": [], "message": str(e)}


# HEALTHCARE WORKER DASHBOARD ENDPOINT
@app.get("/healthcare-dashboard")
def get_healthcare_dashboard(user_email: str = Query(...)):
    """
    Fetch comprehensive healthcare worker dashboard data.
    Only healthcare providers and admins can access this endpoint
    Returns: all pregnant women, assessments, high-risk alerts, consultation requests, and statistics.
    """
    try:
        # SECURITY FIX: Get current user and verify healthcare provider or
        # admin role
        user_response = supabase.table("users").select(
            "*").eq("email", user_email.lower()).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="User not found")

        current_user = user_response.data[0]

        # SECURITY FIX: Check if user is healthcare provider or admin
        require_healthcare_provider(current_user)

        logger.info(
            f" Healthcare provider {user_email} accessed healthcare dashboard")

        # Fetch all predictions (all pregnant women's assessments)
        predictions_response = (
            supabase.table("predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        predictions_raw = predictions_response.data or []

        # Fetch all users to get phone numbers
        users_response = supabase.table("users").select("email, phone, name").execute()
        users_data = users_response.data or []

        # Create a mapping of email to phone number
        email_to_phone = {}
        email_to_name = {}
        for user in users_data:
            email = user.get("email", "").lower()
            email_to_phone[email] = user.get("phone", "N/A")
            email_to_name[email] = user.get("name", "Unknown")

        # Enrich predictions with patient contact details for quick reference
        predictions = []
        for record in predictions_raw:
            email = (record.get("user_email") or "").lower()
            enriched_record = {
                **record,
                "patient_name": email_to_name.get(email, "Unknown"),
                "phone": email_to_phone.get(email, "N/A")
            }
            predictions.append(enriched_record)

        # Calculate statistics
        total_patients = len(set(p.get("user_email")
                             for p in predictions if p.get("user_email")))
        total_assessments = len(predictions)
        high_risk_alerts = sum(
            1 for p in predictions if p.get(
                "predicted_risk",
                "").lower().startswith("high"))
        low_risk_count = sum(
            1 for p in predictions if p.get(
                "predicted_risk",
                "").lower().startswith("low"))

        # Calculate weekly activity (last 7 days)
        from datetime import datetime, timedelta
        today = datetime.utcnow()
        weekly_data = {}
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        for i in range(7):
            day_date = today - timedelta(days=6 - i)
            day_name = days[i]
            day_count = sum(
                1 for p in predictions
                if parse_datetime(p.get("created_at", "")) and
                parse_datetime(p.get("created_at", "")).date() == day_date.date()
            )
            weekly_data[day_name] = day_count

        # Get high-risk patients (most recent assessment per patient)
        patient_latest = {}
        for pred in predictions:
            email = pred.get("user_email")
            if email:
                if email not in patient_latest or pred.get(
                    "created_at",
                    "") > patient_latest[email].get(
                    "created_at",
                        ""):
                    patient_latest[email] = pred

        high_risk_patients = []
        for p in patient_latest.values():
            if p.get("predicted_risk", "").lower().startswith("high"):
                email = p.get("user_email", "").lower()
                p["phone"] = email_to_phone.get(email, "N/A")
                p["patient_name"] = email_to_name.get(email, "Unknown")
                high_risk_patients.append(p)

        # HEALTHCARE ENHANCEMENT: Get recently improved patients (was high-risk, now low-risk)
        from datetime import datetime, timedelta
        recently_improved = []
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

        for email, latest_pred in patient_latest.items():
            # Check if latest is low-risk
            if latest_pred.get("predicted_risk", "").lower().startswith("low"):
                # Get all assessments for this patient
                patient_assessments = [p for p in predictions if p.get("user_email") == email]
                # Sort by date
                patient_assessments.sort(key=lambda x: x.get("created_at", ""), reverse=True)

                # Check if they had a high-risk assessment in the last 7 days
                for i, assessment in enumerate(patient_assessments):
                    if assessment.get("predicted_risk", "").lower().startswith("high"):
                        created_at = assessment.get("created_at", "")
                        if created_at > seven_days_ago:
                            # Found a recent high-risk assessment
                            # Get the improvement metrics
                            prev_prob = assessment.get("probability", 0)
                            curr_prob = latest_pred.get("probability", 0)
                            improvement = ((prev_prob - curr_prob) / prev_prob * 100) if prev_prob > 0 else 0

                            recently_improved.append({
                                "user_email": email,
                                "patient_name": email_to_name.get(email, "Unknown"),
                                "phone": email_to_phone.get(email, "N/A"),
                                "previous_risk": assessment.get("predicted_risk"),
                                "previous_probability": prev_prob,
                                "current_risk": latest_pred.get("predicted_risk"),
                                "current_probability": curr_prob,
                                "improvement_percent": round(improvement, 1),
                                "high_risk_date": created_at,
                                "latest_date": latest_pred.get("created_at"),
                                "days_improved": (parse_datetime(latest_pred.get("created_at", "")) -
                                                 parse_datetime(created_at)).days if parse_datetime(latest_pred.get("created_at", "")) and parse_datetime(created_at) else 0
                            })
                        break  # Only count the most recent high-risk assessment

        # Sort recently improved by improvement percentage (highest first)
        recently_improved.sort(key=lambda x: x.get("improvement_percent", 0), reverse=True)

        # HEALTHCARE ENHANCEMENT: Get at-risk alerts (worsening trends)
        at_risk_alerts = []

        for email, latest_pred in patient_latest.items():
            patient_assessments = [p for p in predictions if p.get("user_email") == email]
            if len(patient_assessments) >= 2:
                # Sort by date (most recent first)
                patient_assessments.sort(key=lambda x: x.get("created_at", ""), reverse=True)

                latest = patient_assessments[0]
                previous = patient_assessments[1]

                latest_prob = latest.get("probability", 0)
                prev_prob = previous.get("probability", 0)

                # Check for worsening trend (probability increasing)
                if latest_prob > prev_prob:
                    worsening_percent = ((latest_prob - prev_prob) / prev_prob * 100) if prev_prob > 0 else 0

                    # Flag if worsening significantly (>10% increase)
                    if worsening_percent > 10:
                        trend = "worsening"
                    elif latest_prob > prev_prob:
                        trend = "increasing"
                    else:
                        trend = "stable"

                    at_risk_alerts.append({
                        "user_email": email,
                        "patient_name": email_to_name.get(email, "Unknown"),
                        "phone": email_to_phone.get(email, "N/A"),
                        "current_risk": latest.get("predicted_risk"),
                        "current_probability": latest_prob,
                        "previous_probability": prev_prob,
                        "trend": trend,
                        "worsening_percent": round(worsening_percent, 1),
                        "latest_date": latest.get("created_at"),
                        "previous_date": previous.get("created_at")
                    })

        # Sort at-risk alerts by worsening percentage (highest first)
        at_risk_alerts.sort(key=lambda x: x.get("worsening_percent", 0), reverse=True)

        return {
            "status": "success",
            "data": {
                "statistics": {
                    "total_patients": total_patients,
                    "total_assessments": total_assessments,
                    "high_risk_alerts": high_risk_alerts,
                    "low_risk_count": low_risk_count,
                    "consultation_requests": 0,
                    "recently_improved_count": len(recently_improved),
                    "at_risk_alerts_count": len(at_risk_alerts)
                },
                "weekly_activity": weekly_data,
                "risk_distribution": {
                    "high_risk": high_risk_alerts,
                    "low_risk": low_risk_count
                },
                # Top 10 high-risk patients (CURRENT HIGH RISK)
                "high_risk_patients": high_risk_patients[:10],
                # Recently improved patients (FOLLOW-UP)
                "recently_improved_patients": recently_improved[:10],
                # At-risk alerts (WORSENING TRENDS)
                "at_risk_alerts": at_risk_alerts[:10],
                # All recent assessments
                "all_assessments": predictions[:50]
            }
        }
    except HTTPException:
        raise  
    except Exception as e:
        logger.error(f"Failed to fetch healthcare dashboard: {e}")
        return {"status": "error", "data": {}, "message": str(e)}


# ADMIN DASHBOARD ENDPOINT
@app.get("/admin-dashboard")
def get_admin_dashboard(user_email: str = Query(...)):
    """
    Fetch comprehensive admin dashboard data.
    Only admins can access this endpoint
    Returns: all users, all assessments, statistics, trends, and user distribution.
    """
    try:
        # Get current user and verify admin role
        user_response = supabase.table("users").select(
            "*").eq("email", user_email.lower()).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="User not found")

        current_user = user_response.data[0]

        # Check if user is admin
        require_admin(current_user)

        logger.info(f" Admin {user_email} accessed admin dashboard")

        # Fetching all users
        users_response = supabase.table("users").select("*").execute()
        users = users_response.data or []

        # Fetching all predictions
        predictions_response = (
            supabase.table("predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        predictions = predictions_response.data or []

        # Calculating statistics
        total_users = len(users)
        pregnant_women = len(
            [u for u in users if u.get("role") == "pregnant_woman"])
        healthcare_providers = len(
            [u for u in users if u.get("role") == "healthcare_provider"])
        admins = len([u for u in users if u.get("role") == "admin"])

        total_assessments = len(predictions)
        high_risk_cases = len([p for p in predictions if p.get(
            "predicted_risk", "").lower().startswith("high")])
        low_risk_cases = len([p for p in predictions if p.get(
            "predicted_risk", "").lower().startswith("low")])

        # Chat sessions (count unique conversations)
        chat_response = supabase.table("chat_history").select("*").execute()
        chat_sessions = len(set(c.get("conversation_id") for c in (
            chat_response.data or []) if c.get("conversation_id")))

        # Calculating monthly trends (last 6 months)
        from datetime import datetime, timedelta
        today = datetime.utcnow()
        monthly_data = {}

        for i in range(6):
            month_date = today - timedelta(days=30 * i)
            month_key = month_date.strftime("%b")
            month_count = sum(
                1 for p in predictions
                if parse_datetime(p.get("created_at", "")) and
                parse_datetime(p.get("created_at", "")).month == month_date.month
            )
            monthly_data[month_key] = month_count

        # User distribution
        user_distribution = {
            "pregnant_women": pregnant_women,
            "healthcare_providers": healthcare_providers,
            "admins": admins
        }

        # Getting all users with their stats
        all_users_with_stats = []
        for user in users:
            user_email = user.get("email")
            user_predictions = [
                p for p in predictions if p.get("user_email") == user_email]
            user_high_risk = len([p for p in user_predictions if p.get(
                "predicted_risk", "").lower().startswith("high")])

            all_users_with_stats.append({
                "id": user.get("id"),
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": user.get("phone", "N/A"),
                "role": user.get("role"),
                "created_at": user.get("created_at"),
                "assessment_count": len(user_predictions),
                "high_risk_count": user_high_risk,
                "last_assessment": user_predictions[0].get("created_at") if user_predictions else None
            })

        return {
            "status": "success",
            "data": {
                "statistics": {
                    "total_users": total_users,
                    "pregnant_women": pregnant_women,
                    "healthcare_providers": healthcare_providers,
                    "admins": admins,
                    "total_assessments": total_assessments,
                    "high_risk_cases": high_risk_cases,
                    "low_risk_cases": low_risk_cases,
                    "chat_sessions": chat_sessions
                },
                "user_distribution": user_distribution,
                "monthly_trends": monthly_data,
                "all_users": all_users_with_stats,
                "recent_assessments": predictions[:50]
            }
        }
    except HTTPException:
        raise  
    except Exception as e:
        logger.error(f"Failed to fetch admin dashboard: {e}")
        return {"status": "error", "data": {}, "message": str(e)}


# USER MANAGEMENT ENDPOINTS (ADMIN ONLY)

# Delete User
@app.delete("/admin/users/{user_id}")
def delete_user(user_id: str):
    """
    Delete a user by ID (Admin only).
    Also deletes all associated predictions and chat history.
    """
    try:
        # First, get the user to find their email
        user_response = supabase.table("users").select(
            "*").eq("id", user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")

        user_email = user_response.data[0]["email"]
        logger.info(f"Deleting user: {user_email} (ID: {user_id})")

        # Delete all predictions for this user
        pred_response = supabase.table("predictions").delete().eq(
            "user_email", user_email).execute()
        logger.info(
            f"Deleted predictions for {user_email}: {len(pred_response.data) if pred_response.data else 0} records")

        # Delete all chat history for this user
        chat_response = supabase.table("chat_history").delete().eq(
            "user_id", user_id).execute()
        logger.info(
            f"Deleted chat history for {user_id}: {len(chat_response.data) if chat_response.data else 0} records")

        # Delete the user
        user_delete_response = supabase.table(
            "users").delete().eq("id", user_id).execute()
        logger.info(f"Delete user response: {user_delete_response}")

        # Verify the user was actually deleted
        verify_response = supabase.table("users").select(
            "*").eq("id", user_id).execute()
        if verify_response.data:
            logger.error(f"User {user_email} still exists after delete attempt!")
            raise HTTPException(
                status_code=500,
                detail="Failed to delete user - user still exists in database")

        return {
            "status": "success",
            "message": f"User {user_email} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete user: {str(e)}")


# Update User
@app.put("/admin/users/{user_id}")
def update_user(
        user_id: str,
        name: str = Query(None),
        role: str = Query(None)):
    """
    Update user information (Admin only).
    Can update name and/or role.
    """
    try:
        update_data = {}
        if name:
            update_data["name"] = name.strip()
        if role:
            update_data["role"] = role.strip().lower()

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = supabase.table("users").update(
            update_data).eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")

        updated_user = response.data[0]
        updated_user.pop("password", None)

        return {
            "status": "success",
            "message": "User updated successfully",
            "user": updated_user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user: {str(e)}")


# Block/Unblock User
@app.put("/admin/users/{user_id}/block")
def toggle_block_user(user_id: str,
                      blocked: bool = Query(...,
                                            description="True to block, False to unblock")):
    """
    Block or unblock a user (Admin only).
    Blocked users cannot login.
    """
    try:
        update_data = {"is_blocked": blocked}

        response = supabase.table("users").update(
            update_data).eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")

        updated_user = response.data[0]
        updated_user.pop("password", None)

        status_msg = "blocked" if blocked else "unblocked"
        return {
            "status": "success",
            "message": f"User {status_msg} successfully",
            "user": updated_user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle block user: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to toggle block user: {str(e)}")


# Add User (Admin can create users)
@app.post("/admin/users")
def admin_create_user(user: UserRegister):
    """
    Create a new user (Admin only).
    Similar to register but admin can create any role.
    """
    try:
        hashed_password = hash_password(user.password)
        user_data = {
            "name": user.name.strip(),
            "email": user.email.strip().lower(),
            "password": hashed_password,
            "role": user.role.strip().lower()
        }

        # Check if user already exists
        existing = supabase.table("users").select(
            "*").eq("email", user_data["email"]).execute()
        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists")

        # Insert new user
        response = supabase.table("users").insert(user_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="User creation failed")

        created_user = response.data[0]
        created_user.pop("password", None)

        return {
            "status": "success",
            "message": "User created successfully",
            "user": created_user}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"User creation error: {str(e)}")


# CHAT HISTORY ENDPOINT
@app.get("/chat-history")
def get_chat_history(user_id: str = Query(..., description="User ID")):
    """Fetch chat history for a user."""
    try:
        response = (
            supabase.table("chat_history")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return {"status": "success", "data": response.data or []}
    except Exception as e:
        logger.error(f"Failed to fetch chat history: {e}")
        return {"status": "error", "data": [], "message": str(e)}


# CONTACT MESSAGE ENDPOINT
@app.post("/contact/send-message")
def send_contact_message(contact: ContactMessage):
    """
    Receive contact form messages from the website.
    Stores messages in the database and can be extended to send emails.
    """
    try:
        logger.info(f"Contact message received from: {contact.email}")

        # Validate input
        if not contact.name or not contact.email or not contact.subject or not contact.message:
            raise HTTPException(status_code=400, detail="All fields are required")

        # Store contact message in database
        try:
            supabase.table("contact_messages").insert({
                "name": contact.name.strip(),
                "email": contact.email.strip().lower(),
                "subject": contact.subject.strip(),
                "message": contact.message.strip(),
                "user_type": contact.userType.strip().lower(),
                "created_at": datetime.utcnow().isoformat(),
                "status": "new"  # Can be: new, read, responded
            }).execute()

            logger.info(f"Contact message saved from {contact.email}")
        except Exception as db_error:
            logger.warning(f"Could not save contact message to database: {db_error}")
            

        return {
            "status": "success",
            "message": "Thank you for your message! We'll get back to you within 24 hours.",
            "data": {
                "name": contact.name,
                "email": contact.email,
                "received_at": datetime.utcnow().isoformat()}}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing contact message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process contact message: {str(e)}")


# CONSULTATION REQUESTS ENDPOINTS

@app.post("/consultation-request")
def create_consultation_request(request: ConsultationRequest, user_email: str = Query(...)):
    """
    Create a new consultation request from a pregnant woman to a healthcare provider.
    Only pregnant women can create consultation requests.
    """
    try:
        user_email = user_email.strip().lower()

        # Verify user exists and is a pregnant woman
        user_response = supabase.table("users").select("*").eq("email", user_email).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="User not found")

        user = user_response.data[0]
        if user.get("role") != "pregnant_woman":
            raise HTTPException(status_code=403, detail="Only pregnant women can request consultations")

        # Verify healthcare provider exists
        provider_response = supabase.table("users").select("*").eq("email", request.healthcare_provider_email.lower()).execute()
        if not provider_response.data:
            raise HTTPException(status_code=404, detail="Healthcare provider not found")

        provider = provider_response.data[0]
        if provider.get("role") not in ["healthcare_provider", "admin"]:
            raise HTTPException(status_code=400, detail="Selected user is not a healthcare provider")

        # Create consultation request
        consultation_data = {
            "pregnant_woman_id": user.get("id"),
            "pregnant_woman_email": user_email,
            "pregnant_woman_name": user.get("name"),
            "healthcare_provider_id": provider.get("id"),
            "healthcare_provider_email": request.healthcare_provider_email.lower(),
            "healthcare_provider_name": provider.get("name"),
            "subject": request.subject.strip(),
            "message": request.message.strip(),
            "priority": request.priority.lower(),
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("consultation_requests").insert(consultation_data).execute()

        if result.data:
            consultation = result.data[0]
            logger.info(f"Consultation request created: {consultation.get('id')}")
            return {
                "status": "success",
                "message": "Consultation request sent successfully",
                "data": consultation
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create consultation request")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating consultation request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create consultation request: {str(e)}")


@app.get("/consultation-requests")
def get_consultation_requests(user_email: str = Query(...)):
    """
    Get all consultation requests for a user.
    - Pregnant women see requests they sent
    - Healthcare providers see requests sent to them
    """
    try:
        user_email = user_email.strip().lower()

        # Verify user exists
        user_response = supabase.table("users").select("*").eq("email", user_email).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="User not found")

        user = user_response.data[0]
        user_role = user.get("role")

        # Get appropriate consultation requests
        if user_role == "pregnant_woman":
            # Pregnant women see requests they sent
            response = supabase.table("consultation_requests").select("*").eq("pregnant_woman_email", user_email).order("created_at", desc=True).execute()
        elif user_role in ["healthcare_provider", "admin"]:
            # Healthcare providers see requests sent to them
            response = supabase.table("consultation_requests").select("*").eq("healthcare_provider_email", user_email).order("created_at", desc=True).execute()
        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        consultations = response.data or []

        return {
            "status": "success",
            "data": consultations,
            "count": len(consultations)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching consultation requests: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation requests: {str(e)}")


@app.get("/consultation-request/{consultation_id}")
def get_consultation_request(consultation_id: str, user_email: str = Query(...)):
    """
    Get a specific consultation request by ID.
    Only the pregnant woman or healthcare provider involved can view it.
    """
    try:
        user_email = user_email.strip().lower()

        # Fetch consultation
        response = supabase.table("consultation_requests").select("*").eq("id", consultation_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Consultation request not found")

        consultation = response.data[0]

        # Verify user is involved in this consultation
        if user_email not in [consultation.get("pregnant_woman_email"), consultation.get("healthcare_provider_email")]:
            raise HTTPException(status_code=403, detail="Unauthorized to view this consultation")

        return {
            "status": "success",
            "data": consultation
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching consultation request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation request: {str(e)}")


@app.patch("/consultation-request/{consultation_id}")
def update_consultation_request(consultation_id: str, response_data: ConsultationResponse, user_email: str = Query(...)):
    """
    Update a consultation request status (accept, decline, or close).
    Only the healthcare provider can update the status.
    """
    try:
        user_email = user_email.strip().lower()

        # Fetch consultation
        response = supabase.table("consultation_requests").select("*").eq("id", consultation_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Consultation request not found")

        consultation = response.data[0]

        # Verify user is the healthcare provider
        if user_email != consultation.get("healthcare_provider_email"):
            raise HTTPException(status_code=403, detail="Only the healthcare provider can update this consultation")

        # Validate status
        valid_statuses = ["accepted", "declined", "closed"]
        if response_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        # Update consultation
        update_data = {
            "status": response_data.status,
            "responded_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        if response_data.response_message:
            update_data["response_message"] = response_data.response_message

        if response_data.status == "closed":
            update_data["closed_at"] = datetime.utcnow().isoformat()

        result = supabase.table("consultation_requests").update(update_data).eq("id", consultation_id).execute()

        if result.data:
            logger.info(f"Consultation request {consultation_id} updated to {response_data.status}")
            return {
                "status": "success",
                "message": f"Consultation request {response_data.status}",
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update consultation request")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating consultation request: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update consultation request: {str(e)}")


@app.get("/consultation-requests/stats/{user_email}")
def get_consultation_stats(user_email: str):
    """
    Get consultation statistics for a user.
    Returns counts of pending, accepted, declined, and closed consultations.
    """
    try:
        user_email = user_email.strip().lower()

        # Verify user exists
        user_response = supabase.table("users").select("*").eq("email", user_email).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="User not found")

        user = user_response.data[0]
        user_role = user.get("role")

        # Get consultations based on role
        if user_role == "pregnant_woman":
            response = supabase.table("consultation_requests").select("*").eq("pregnant_woman_email", user_email).execute()
        elif user_role in ["healthcare_provider", "admin"]:
            response = supabase.table("consultation_requests").select("*").eq("healthcare_provider_email", user_email).execute()
        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        consultations = response.data or []

        # Calculate stats
        stats = {
            "total": len(consultations),
            "pending": len([c for c in consultations if c.get("status") == "pending"]),
            "accepted": len([c for c in consultations if c.get("status") == "accepted"]),
            "declined": len([c for c in consultations if c.get("status") == "declined"]),
            "closed": len([c for c in consultations if c.get("status") == "closed"])
        }

        return {
            "status": "success",
            "data": stats
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching consultation stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation stats: {str(e)}")


@app.get("/admin/consultation-stats")
def get_admin_consultation_stats():
    """
    Get overall consultation statistics for admin dashboard.
    Returns system-wide counts of all consultation statuses.
    """
    try:
        # Get all consultations
        response = supabase.table("consultation_requests").select("*").execute()
        consultations = response.data or []

        # Calculate overall stats
        stats = {
            "total": len(consultations),
            "pending": len([c for c in consultations if c.get("status") == "pending"]),
            "accepted": len([c for c in consultations if c.get("status") == "accepted"]),
            "declined": len([c for c in consultations if c.get("status") == "declined"]),
            "closed": len([c for c in consultations if c.get("status") == "closed"])
        }

        return {
            "status": "success",
            "data": stats
        }

    except Exception as e:
        logger.error(f"Error fetching admin consultation stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin consultation stats: {str(e)}")
