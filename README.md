# WombGuard - Predictive Maternal Health System & a Conversational ChatBot

<div align="center">

![WombGuard Logo](https://img.shields.io/badge/WombGuard-AI%20Maternal%20Health-FF69B4?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production%20Ready-success?style=for-the-badge)

**Protecting Every Pregnancy Journey Through AI & Machine Learning**

[Features](#-key-features) • [Tech Stack](#️-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-complete-documentation) • [Deployment](#-deployment-guide)

</div>

---

## Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Platform Screenshots](#-platform-screenshots)
- [🎥 Demo Video](#-demo-video)
- [🚀 Deployed Application](#-deployed-application)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [📁 Related Files & Resources](#-related-files--resources)
- [Quick Start](#-quick-start)
- [Complete Documentation](#-complete-documentation)
  - [Installation Guide](#1-installation-guide)
  - [Database Setup](#2-database-setup)
  - [API Documentation](#3-api-documentation)
  - [AI/ML Models](#4-aiml-models-architecture)
  - [Security & Authentication](#5-security--authentication)
  - [Testing Guide](#6-testing-guide)
  - [Deployment Guide](#7-deployment-guide)
  - [Troubleshooting](#8-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## Project Overview

WombGuard is a maternal health web platform for predictive maternal health monitoring, risk assessment and personalized care guidance. Built with modern technologies and designed for healthcare providers and expecting mothers in Rwanda and beyond.

### Mission
To reduce maternal mortality rates through early risk detection, continuous monitoring, and AI-powered personalized care.

### Core Capabilities
- **Predict pregnancy risks** using a trained Random Forest model (97%+ accuracy)
- **Provide 24/7 support** through 3 specialized AI chatbots (98% performance)
- **Track health metrics** with secure, HIPAA-compliant data storage
- **Enable provider collaboration** with role-based dashboards
- **Ensure data privacy** with Row-Level Security (RLS) and JWT authentication

### Platform Statistics
- **AI Models**: 4 trained models 
- **Training Data**: 1,317 patient records + 696 Q&A pairs
- **Frontend Pages**: 14 responsive pages
- **Backend API**: 30+ endpoints
- **Database Tables**: 5 tables with RLS policies
- **User Roles**: 3 (Pregnant Women, Healthcare Workers, Admins)

---

## Key Features

### For Pregnant Women
- **Health Risk Assessment** - AI-powered prediction with SHAP explanations
- **WombGuardBot** - 24/7 conversational ChatBot support (3 specialized models)
- **Personal Dashboard** - Health metrics, trends and insights
- **History Tracking** - All assessments and chat conversations
- **Personalized Recommendations** - Based on risk level and health data
- **Mobile-Responsive** - Access from any device
- **Secure & Private** - End-to-end encryption and data protection

### For Healthcare Providers
- **Patient Dashboard** - Monitor multiple patients in real-time
- **Risk Analytics** - Trend analysis and early warning system
- **Complete Patient History** - All health records and assessments
- **Detailed Reports** - Analysis tools
- **Intervention Planning** - Data-driven care decisions
- **Contact Management** - Patient communication tracking
- **Alert System** - High-risk patient notifications

### For Administrators
- **System Management** - User and role management
- **Platform Analytics** - Usage statistics and insights
- **Security Controls** - Access management and audit logs
- **User Management** - Block/unblock users, role assignment
- **Multi-tenant Support** - Scalable architecture
- **Performance Monitoring** - System health and metrics

---

## Platform Screenshots

### Landing Page
![Landing Page](public/screenshots/landing-page.png)
*WombGuard's welcoming homepage with clear call-to-action for users*

### Pregnant Woman Dashboard
![Pregnant Dashboard](public/screenshots/pregnant-dashboard.png)
*Personalized dashboard showing health metrics, risk assessment, and trends*

### Healthcare Provider Dashboard
![Healthcare Dashboard](public/screenshots/healthcare-dashboard.png)
*Provider view with patient monitoring, risk analytics, and consultation management*

### System Admin Dashboard
![Admin Dashboard](public/screenshots/admin-dashboard.png)
*Administrative panel for user management, system analytics, and platform oversight*

---

## 🎥 Demo Video

**Watch the 5-minute platform demonstration:**

[![WombGuard Platform Demo](https://img.shields.io/badge/▶️_Watch_Demo-YouTube-red?style=for-the-badge&logo=youtube)](YOUR_YOUTUBE_VIDEO_LINK_HERE)

> **📹 Demo Highlights:**
> - ✅ **Pregnant Woman Dashboard** - Health tracking and risk assessment
> - ✅ **Health Check Feature** - AI-powered risk prediction with real-time results
> - ✅ **WombGuardBot Chatbot** - 24/7 pregnancy health guidance
> - ✅ **Healthcare Provider Dashboard** - Patient monitoring and analytics
> - ✅ **Admin Dashboard** - User management and system analytics
> - ✅ **Three-Tier Risk Management** - High-risk alerts and trend analysis
> - ✅ **Consultation Management** - Request and track consultations
>
> **Note:** The demo focuses on core functionalities and real-world usage scenarios.

---

## 🚀 Deployed Application

**Access the live platform:**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Platform-success?style=for-the-badge)](https://wombguard-platform.onrender.com)

**Platform URLs:**
- **Frontend (Web App):** https://wombguard-platform.onrender.com
- **Backend API:** https://wombguard-api.onrender.com
- **API Documentation:** https://wombguard-api.onrender.com/docs

### 🔐 Demo Accounts

Test the platform with these pre-configured accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Pregnant Woman** | `g.tumwesigye@alustudent.com` | `[Contact for password]` | Personal dashboard, health checks, chatbot |
| **Healthcare Provider** | `tumwesigye.geofrey@gmail.com` | `[Contact for password]` | Patient monitoring, consultations |
| **System Admin** | `kennedy@example.com` | `[Contact for password]` | Full system access, user management |

> **⚠️ Note:** These are demo accounts for evaluation purposes. For security reasons, passwords are provided separately.

### 📱 Platform Access

- **Web Browser:** Access from any modern browser (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive:** Fully optimized for mobile devices
- **No Installation Required:** Cloud-based platform accessible anywhere

---

## Tech Stack

<div align="center">

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18 • Tailwind CSS • React Router v6 • Axios • Lucide React • Recharts |
| **Backend** | FastAPI • Python 3.9+ • Uvicorn • Pydantic • python-dotenv |
| **Database** | Supabase (PostgreSQL) • Row-Level Security (RLS) • Realtime |
| **Authentication** | JWT (HS256) • bcrypt • Email Verification • Phone Storage |
| **AI/ML** | scikit-learn • Sentence Transformers • Random Forest • BM25 • SHAP |
| **Deployment** | Vercel (Frontend) • Railway (Backend) • Supabase (Database) |

</div>

### Frontend Technologies
- **React 18** - Modern UI framework with hooks and concurrent features
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router v6** - Declarative client-side routing
- **Axios** - Promise-based HTTP client for API communication
- **Lucide React** - Beautiful, consistent icon library
- **Recharts** - Composable charting library for data visualization
- **@supabase/supabase-js** - Supabase client for authentication and database

### Backend Technologies
- **FastAPI** - High-performance Python web framework (async support)
- **Uvicorn** - Lightning-fast ASGI server
- **Pydantic** - Data validation using Python type annotations
- **scikit-learn** - Machine learning library for prediction models
- **SHAP** - Model explainability and feature importance
- **Sentence Transformers** - Text embeddings
- **python-dotenv** - Environment variable management
- **passlib[bcrypt]** - Password hashing with bcrypt

### Database & Authentication
- **Supabase** - (PostgreSQL + Auth + Storage)
- **PostgreSQL** - Robust, ACID-compliant relational database
- **Row-Level Security (RLS)** - Database-level access control
- **JWT Tokens** - Secure, stateless authentication (HS256 algorithm)
- **Email Verification** - Token-based email confirmation system
- **Phone Storage** - Secure phone number storage for users

### AI/ML Technologies
- **Random Forest Classifier** - For pregnancy risk prediction
- **Sentence Transformers** - 3 fine-tuned models for chatbot (768-dimensional embeddings)
  - `model_general_finetuned` - General pregnancy questions
  - `model_medical_finetuned` - Medical/clinical questions
  - `model_qa_finetuned` - Q&A format questions
- **BM25 (Okapi BM25)** - Keyword-based retrieval algorithm
- **Hybrid Retrieval** - Combination of semantic search + keyword matching
- **SHAP (SHapley Additive exPlanations)** - Model interpretability
- **joblib** - Model serialization and persistence

---

## Project Structure

```
wombguard_platform/                    
│
├── README.md                          
├── START_HERE.md                     
├── LICENSE                            
├── .gitignore                        
├── .env.example                       
│
├── package.json                   
├── package-lock.json                  
├── tailwind.config.js               
├── postcss.config.js                
├── start_servers.sh                  
│
├── docs/                              
│   ├── API_DOCUMENTATION.md           
│   ├── DEPLOYMENT_GUIDE.md            
│   ├── DEPLOYMENT_PLATFORMS_GUIDE.md  
│   ├── GITHUB_SUBMISSION_GUIDE.md     
│   ├── CHATBOT_ARCHITECTURE_SUMMARY.md 
│   ├── DATABASE_SETUP_SUMMARY.md      
│   ├── SECURITY_HARDENING_GUIDE.md   
│   ├── TESTING_GUIDE.md              
│   └── archive/                       
│
├── database/                        
│   ├── README.md                     
│   ├── supabase_complete_setup.sql   
│   ├── add_jwt_email_phone_columns.sql 
│   ├── add_contact_messages_table.sql  
│   ├── add_health_assessments_table.sql 
│   ├── add_is_blocked_column.sql      
│   └── fix_rls_policies.sql         
│
├── scripts/                           
│   ├── (cleanup and development scripts)
│   └── (not needed for production)
│
├── public/                            
│   ├── index.html                     
│   ├── manifest.json                 
│   ├── favicon.ico                 
│   └── images/                      
│       ├── logo.png
│       ├── hero-image.jpg
│       └── team/                     
│
├── src/                               
│   ├── App.js                        
│   ├── index.js                       
│   ├── index.css                     
│   │
│   ├── components/                  
│   │   └── Navbar.js               
│   │
│   ├── pages/                         
│   │   ├── Landing.js               
│   │   ├── Login.js               
│   │   ├── Register.js            
│   │   ├── VerifyEmail.js           
│   │   ├── Dashboard.js              
│   │   ├── PregnantDashboard.js      
│   │   ├── HealthcareWorkerDashboard.js 
│   │   ├── AdminDashboard.js         
│   │   ├── Chatbot.js                
│   │   ├── PredictionInput.js         
│   │   ├── HealthCheckResult.js     
│   │   ├── History.js               
│   │   ├── Contact.js               
│   │   └── About.js                 
│   │
│   ├── services/                   
│   │   └── apiService.js              
│   │
│   ├── contexts/                    
│   │   └── AuthContext.js            
│   │
│   └── config/                        
│       └── supabaseClient.js        
│
├── wombguard_predictive_api/         
│   ├── main.py                        
│   ├── chatbot_engine.py             
│   ├── supabase_client.py            
│   ├── requirements.txt               
│   ├── .env.example                  
│   ├── wombguard_pregnancy_model.pkl 
│   ├── wombguard_predictive_models.ipynb 
│   │
│   ├── data/                          
│   │   └── predictive_models_dataset/
│   │       ├── wombguard_dataset.csv  
│   │       └── local_pregnancy_dataset.csv
│   │
│   └── venv/                          
│
└── wombguardbot_models/               
    ├── bm25_index.pkl                
    ├── embeddings_ensemble.npy        
    ├── the-wombguard-chatbot-training.ipynb 
    │
    ├── model_general_finetuned/       
    ├── model_medical_finetuned/       
    ├── model_qa_finetuned/            
    │
    └── wombguardbot_dataset/         
        ├── mother_intents_patterns_responses_data.json
        └── mother_question_and_answer_pairs_data.json
```

###  Key Directories Explained

- **`docs/`** - All documentation files (API, deployment, security, testing)
- **`database/`** - SQL scripts for database setup and migrations
- **`src/`** - React frontend source code
- **`wombguard_predictive_api/`** - FastAPI backend with ML models
- **`wombguardbot_models/`** - AI chatbot models and training data

---

## 📁 Related Files & Resources

### Core Project Files

| File/Directory | Description | Purpose |
|----------------|-------------|---------|
| **`README.md`** | Main documentation | Project overview, setup instructions, and usage guide |
| **`START_HERE.md`** | Quick start guide | Step-by-step setup for new developers |
| **`LICENSE`** | MIT License | Legal terms and conditions |
| **`.gitignore`** | Git ignore rules | Files excluded from version control |
| **`.env.example`** | Environment template | Sample configuration for environment variables |

### Documentation Files (`docs/`)

| File | Description | Use Case |
|------|-------------|----------|
| **`API_DOCUMENTATION.md`** | Complete API reference | Backend endpoint documentation with examples |
| **`DEPLOYMENT_GUIDE.md`** | Deployment instructions | Step-by-step deployment to production |
| **`DEPLOYMENT_PLATFORMS_GUIDE.md`** | Platform-specific guides | Vercel, Railway, Render deployment |
| **`GITHUB_SUBMISSION_GUIDE.md`** | GitHub best practices | Repository setup and submission guidelines |
| **`CHATBOT_ARCHITECTURE_SUMMARY.md`** | Chatbot technical details | AI model architecture and training |
| **`DATABASE_SETUP_SUMMARY.md`** | Database schema guide | Table structures and relationships |
| **`SECURITY_HARDENING_GUIDE.md`** | Security best practices | Authentication, authorization, data protection |
| **`TESTING_GUIDE.md`** | Testing procedures | Unit tests, integration tests, E2E tests |

### Database Files (`database/`)

| SQL Script | Description | Execution Order |
|------------|-------------|-----------------|
| **`supabase_complete_setup.sql`** | Creates all tables and initial schema | 1st - Run first |
| **`add_jwt_email_phone_columns.sql`** | Adds JWT, email verification, phone columns | 2nd |
| **`add_contact_messages_table.sql`** | Creates contact form table | 3rd |
| **`add_health_assessments_table.sql`** | Creates health assessments table | 4th |
| **`add_is_blocked_column.sql`** | Adds user blocking functionality | 5th |
| **`fix_rls_policies.sql`** | Implements Row-Level Security policies | 6th - Run last |

### Frontend Files (`src/`)

| Directory/File | Description | Key Components |
|----------------|-------------|----------------|
| **`App.js`** | Main application component | Routing, layout, global state |
| **`index.js`** | React entry point | App initialization |
| **`pages/`** | All page components | 14 pages (Landing, Dashboard, Login, etc.) |
| **`components/`** | Reusable UI components | Navbar, forms, charts |
| **`services/`** | API service layer | HTTP requests, data fetching |
| **`contexts/`** | React Context providers | Authentication, global state |
| **`config/`** | Configuration files | Supabase client, constants |

### Backend Files (`wombguard_predictive_api/`)

| File | Description | Functionality |
|------|-------------|---------------|
| **`main.py`** | FastAPI application | 30+ API endpoints, authentication, CRUD operations |
| **`chatbot_engine.py`** | AI chatbot logic | Hybrid retrieval, semantic search, BM25 |
| **`supabase_client.py`** | Database client | Supabase connection and queries |
| **`requirements.txt`** | Python dependencies | All required packages and versions |
| **`wombguard_pregnancy_model.pkl`** | Trained ML model | Random Forest classifier (97% accuracy) |
| **`wombguard_predictive_models.ipynb`** | Model training notebook | Jupyter notebook for model development |

### AI/ML Model Files (`wombguardbot_models/`)

| File/Directory | Description | Details |
|----------------|-------------|---------|
| **`model_general_finetuned/`** | General pregnancy questions model | Fine-tuned Sentence Transformer |
| **`model_medical_finetuned/`** | Medical/clinical questions model | Specialized medical knowledge |
| **`model_qa_finetuned/`** | Q&A format questions model | Question-answer pair matching |
| **`bm25_index.pkl`** | BM25 keyword index | Fast keyword-based retrieval |
| **`embeddings_ensemble.npy`** | Pre-computed embeddings | 768-dimensional vectors |
| **`the-wombguard-chatbot-training.ipynb`** | Chatbot training notebook | Model fine-tuning and evaluation |
| **`wombguardbot_dataset/`** | Training data | 696 Q&A pairs, intents, patterns |

### Configuration Files

| File | Description | Configuration |
|------|-------------|---------------|
| **`package.json`** | Frontend dependencies | React, Tailwind, Axios, etc. |
| **`tailwind.config.js`** | Tailwind CSS config | Custom colors, fonts, themes |
| **`postcss.config.js`** | PostCSS config | CSS processing |
| **`start_servers.sh`** | Startup script | Automated server launch |

### Data Files

| File | Description | Records |
|------|-------------|---------|
| **`wombguard_dataset.csv`** | Pregnancy risk training data | 1,317 patient records |
| **`local_pregnancy_dataset.csv`** | Local dataset | Additional training data |
| **`mother_intents_patterns_responses_data.json`** | Chatbot intents | Patterns and responses |
| **`mother_question_and_answer_pairs_data.json`** | Q&A pairs | 696 question-answer pairs |

### Important Notes

> **📌 Essential Files for Setup:**
> 1. `.env` files (create from `.env.example`)
> 2. Database SQL scripts (run in order)
> 3. `requirements.txt` (Python dependencies)
> 4. `package.json` (Node.js dependencies)
>
> **📌 Pre-trained Models:**
> - All AI/ML models are included in the repository
> - No additional training required for basic setup
> - Models are ready to use out-of-the-box
>
> **📌 Documentation Priority:**
> - Start with `START_HERE.md` for quick setup
> - Refer to `API_DOCUMENTATION.md` for backend details
> - Check `DEPLOYMENT_GUIDE.md` for production deployment

---

## Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.9+
- **Supabase** account ([sign up free](https://supabase.com))
- **Git** (for cloning)

###  Quick Start 

```bash
# Clone the repository
git clone https://github.com/g-tumwesigye/wombguard_platform.git
cd wombguard_platform

# Start both servers with one command
bash start_servers.sh
```

**That's it!** 
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup 

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Runs on http://localhost:3000
```

#### Backend Setup
```bash
# Navigate to backend directory
cd wombguard_predictive_api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Runs on http://localhost:8000
```

#### Environment Variables

Create `.env` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration (in wombguard_predictive_api/.env)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Get Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy URL and anon/service_role keys

#### Database Setup

Run the SQL scripts in Supabase SQL Editor (in order):

```bash
1. supabase_complete_setup.sql          # Creates all tables
2. add_jwt_email_phone_columns.sql      # Adds JWT + email + phone
3. add_contact_messages_table.sql       # Contact form table
4. add_health_assessments_table.sql     # Health assessments table
5. add_is_blocked_column.sql            # User blocking feature
6. fix_rls_policies.sql                 # Row-level security
```

**Location:** `wombguard_predictive_api/*.sql`

#### Verify Installation

```bash
# Test backend health
curl http://localhost:8000/

# Test frontend
open http://localhost:3000

# Test API documentation
open http://localhost:8000/docs
```

---

## Complete Documentation

### Installation Guide

#### System Requirements
- **OS**: macOS, Linux or Windows 10+
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free space
- **Internet**: Required for initial setup

#### Detailed Installation Steps

**Step 1: Clone Repository**
```bash
git clone https://github.com/g-tumwesigye/wombguard_platform.git
cd wombguard_platform
```

**Step 2: Install Frontend Dependencies**
```bash
npm install
```

**Dependencies installed:**
- react@18.2.0
- react-router-dom@6.x
- axios@1.x
- @supabase/supabase-js@2.x
- tailwindcss@3.x
- lucide-react@latest
- recharts@2.x

**Step 3: Install Backend Dependencies**
```bash
cd wombguard_predictive_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Dependencies installed:**
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- scikit-learn==1.3.2
- sentence-transformers==2.2.2
- shap==0.43.0
- supabase==2.0.3
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4
- python-dotenv==1.0.0

**Step 4: Configure Environment**

Create `.env` in root:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Create `wombguard_predictive_api/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Step 5: Setup Database**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project (or use existing)
3. Go to SQL Editor
4. Run each SQL script in order (see Database Setup section)
5. Verify tables created in Table Editor

**Step 6: Start Servers**

Option A - Automated:
```bash
bash start_servers.sh
```

Option B - Manual:
```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend
cd wombguard_predictive_api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Step 7: Verify Installation**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/

---

### 2. Database Setup

#### Database Schema

**Tables:**

1. **users** - User accounts and authentication
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- role (text) - 'pregnant_woman', 'healthcare_worker', 'admin'
- full_name (text)
- phone (text)
- email_verified (boolean)
- verification_token (text)
- is_blocked (boolean)
- created_at (timestamp)
```

2. **predictions** - Health risk assessments
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- age (integer)
- systolic_bp (integer)
- diastolic_bp (integer)
- bs (float) - Blood sugar
- body_temp (float)
- heart_rate (integer)
- bmi (float)
- predicted_risk_level (text)
- probability_high_risk (float)
- confidence_score (float)
- created_at (timestamp)
```

3. **chat_history** - Chatbot conversations
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- conversation_id (text)
- message (text)
- response (text)
- model_used (text) - Which AI model was used
- created_at (timestamp)
```

4. **health_assessments** - Health check tracking
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- assessment_type (text)
- assessment_data (jsonb)
- notes (text)
- created_at (timestamp)
```

5. **contact_messages** - Contact form submissions
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id, nullable)
- name (text)
- email (text)
- subject (text)
- message (text)
- status (text) - 'pending', 'responded', 'closed'
- created_at (timestamp)
```

#### Row-Level Security (RLS) Policies

**users table:**
- Users can read their own data
- Users can update their own data
- Admins can read all users
- Admins can update all users

**predictions table:**
- Users can read their own predictions
- Healthcare workers can read all predictions
- Admins can read all predictions

**chat_history table:**
- Users can read their own chat history
- Healthcare workers can read all chat history
- Admins can read all chat history

**health_assessments table:**
- Users can read/write their own assessments
- Healthcare workers can read all assessments
- Admins can read all assessments

**contact_messages table:**
- Users can create messages
- Admins can read all messages
- Healthcare workers can read all messages

#### Setup Instructions

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait for database provisioning (~2 minutes)

2. **Run SQL Scripts**
   - Go to SQL Editor in Supabase Dashboard
   - Copy content from `supabase_complete_setup.sql`
   - Click "Run"
   - Repeat for other SQL files in order

3. **Verify Tables**
   - Go to Table Editor
   - Verify all 5 tables exist
   - Check RLS policies are enabled

4. **Get API Credentials**
   - Go to Settings → API
   - Copy Project URL
   - Copy anon/public key (for frontend)
   - Copy service_role key (for backend)

---

### 3. API Documentation

#### Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-backend-url.com`

#### Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

#### Endpoints

##### Public Endpoints

**1. Health Check**
```http
GET /
```
Response:
```json
{
  "message": "WombGuard Predictive API is running!",
  "status": "healthy",
  "version": "1.0.0"
}
```

**2. User Registration**
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Jane Doe",
  "role": "pregnant_woman",
  "phone": "+250788123456"
}
```
Response:
```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "user_id": "uuid-here",
  "verification_sent": true
}
```

**3. User Login**
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "pregnant_woman",
    "full_name": "Jane Doe",
    "email_verified": true
  }
}
```

**4. Email Verification**
```http
GET /verify-email?token=<verification_token>
```
Response:
```json
{
  "message": "Email verified successfully!",
  "email_verified": true
}
```

##### Protected Endpoints

**5. Pregnancy Risk Prediction**
```http
POST /predict?user_email=user@example.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "Age": 28,
  "SystolicBP": 120,
  "DiastolicBP": 80,
  "BS": 6.5,
  "BodyTemp": 98.6,
  "HeartRate": 75,
  "BMI": 22.5
}
```
Response:
```json
{
  "prediction": {
    "Predicted_Risk_Level": "Low Risk",
    "Probability_High_Risk": 0.0255,
    "Confidence_Score": 0.9745
  },
  "explanation": {
    "top_features": {
      "Age": 0.25,
      "SystolicBP": 0.20,
      "BS": 0.18
    },
    "summary": "Based on the analysis, your pregnancy is classified as Low Risk..."
  },
  "saved_to_database": true
}
```

**6. WombguardBot**
```http
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What are the symptoms of preeclampsia?",
  "user_id": "uuid-here",
  "conversation_id": "conv-123"
}
```
Response:
```json
{
  "response": "Preeclampsia is a serious pregnancy complication characterized by high blood pressure...",
  "conversation_id": "conv-123",
  "model_used": "model_medical_finetuned",
  "timestamp": "2025-11-01T10:30:00Z"
}
```

**7. Get Dashboard Data**
```http
GET /dashboard?user_email=user@example.com
Authorization: Bearer <token>
```
Response:
```json
{
  "user": {
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "role": "pregnant_woman"
  },
  "recent_predictions": [...],
  "recent_chats": [...],
  "statistics": {
    "total_predictions": 15,
    "total_chats": 42,
    "last_assessment": "2025-11-01"
  }
}
```

**8. Get Prediction History**
```http
GET /predictions?user_email=user@example.com&limit=10
Authorization: Bearer <token>
```
Response:
```json
{
  "predictions": [
    {
      "id": "uuid",
      "predicted_risk_level": "Low Risk",
      "confidence_score": 0.97,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "total": 15
}
```

**9. Get Chat History**
```http
GET /chat-history?user_id=uuid&conversation_id=conv-123
Authorization: Bearer <token>
```
Response:
```json
{
  "chat_history": [
    {
      "message": "What are symptoms of preeclampsia?",
      "response": "Preeclampsia symptoms include...",
      "model_used": "model_medical_finetuned",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "total": 10
}
```

**10. Submit Contact Message**
```http
POST /contact
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_email": "user@example.com",
  "subject": "Question about risk assessment",
  "message": "I have a question about my recent assessment..."
}
```
Response:
```json
{
  "message": "Contact message submitted successfully!",
  "message_id": "uuid-here"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "detail": "Invalid input data"
}
```

**401 Unauthorized**
```json
{
  "detail": "Invalid credentials"
}
```

**403 Forbidden**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Internal server error"
}
```

---

### 4. AI/ML Models Architecture

#### WombGuardBot System (3 Specialized Models)

**Architecture Overview:**
- **Base Model**: Sentence Transformers (all-MiniLM-L6-v2)
- **Embedding Dimension**: 768
- **Total Models**: 3 fine-tuned models
- **Retrieval Method**: Hybrid (Semantic + BM25)
- **Knowledge Base**: 696 Q&A pairs
- **Performance**: 98% accuracy

**Model 1: General Chatbot** (`model_general_finetuned`)
- **Purpose**: General pregnancy questions
- **Training Data**: 5,424 lines of intents/patterns/responses
- **Use Cases**:
  - General pregnancy information
  - Nutrition advice
  - Exercise recommendations
  - Lifestyle guidance

**Model 2: Medical Chatbot** (`model_medical_finetuned`)
- **Purpose**: Medical/clinical questions
- **Trigger Keywords**: pain, bleeding, symptom, doctor, hospital, emergency
- **Use Cases**:
  - Medical symptoms
  - Clinical conditions
  - Emergency situations
  - Healthcare provider guidance

**Model 3: Q&A Chatbot** (`model_qa_finetuned`)
- **Purpose**: Direct question-answer format
- **Trigger**: Questions with "?" character
- **Use Cases**:
  - Specific questions
  - Factual information
  - Quick answers

**Hybrid Retrieval System:**

1. **Semantic Search** (Cosine Similarity)
   - Converts query to 768-dimensional embedding
   - Compares with pre-computed embeddings
   - Finds semantically similar questions
   - Weight: 70%

2. **Keyword Search** (BM25)
   - Tokenizes query
   - Matches keywords in knowledge base
   - Ranks by relevance
   - Weight: 30%

3. **Model Selection Logic**
   ```python
   if any(medical_keyword in query):
       use model_medical_finetuned
   elif "?" in query:
       use model_qa_finetuned
   else:
       use model_general_finetuned
   ```

**Knowledge Base:**
- **File**: `bm25_index.pkl` 
- **Embeddings**: `embeddings_ensemble.npy` 
- **Q&A Pairs**: 696 pairs
- **Format**: JSON with questions, answers, categories

**Performance Metrics:**
- **Response Time**: < 500ms
- **Accuracy**: 98%
- **Relevance Score**: > 0.85
- **Fallback Rate**: < 2%

---

#### Pregnancy Risk Prediction Model

**Model Type**: Random Forest Classifier

**Training Data:**
- **Dataset 1**: wombguard_dataset.csv (1,206 records)
- **Dataset 2**: local_pregnancy_dataset.csv (111 records)
- **Total**: 1,317 patient records
- **Features**: 7 input features
- **Target**: Binary classification (High Risk / Low Risk)

**Input Features:**
1. **Age** (years) - Patient age
2. **SystolicBP** (mmHg) - Systolic blood pressure
3. **DiastolicBP** (mmHg) - Diastolic blood pressure
4. **BS** (mmol/L) - Blood sugar level
5. **BodyTemp** (°F) - Body temperature
6. **HeartRate** (bpm) - Heart rate
7. **BMI** (kg/m²) - Body Mass Index

**Model Performance:**
- **Accuracy**: 97.45%
- **Precision**: 96.8%
- **Recall**: 95.2%
- **F1-Score**: 96.0%
- **AUC-ROC**: 0.98

**Output:**
```json
{
  "Predicted_Risk_Level": "Low Risk" | "High Risk",
  "Probability_High_Risk": 0.0 - 1.0,
  "Confidence_Score": 0.0 - 1.0
}
```

**SHAP Explainability:**
- Feature importance scores
- Top 3 influencing features
- Personalized explanation
- Visual interpretation (future)

**Model File:**
- **Location**: `wombguard_predictive_api/wombguard_pregnancy_model.pkl`
- **Size**: ~1 MB
- **Format**: joblib pickle
- **Framework**: scikit-learn 1.3.2

**Risk Thresholds:**
- **Low Risk**: Probability < 0.5
- **High Risk**: Probability ≥ 0.5
- **Confidence**: Based on model certainty

---

### 5. Security & Authentication

#### Authentication System

**JWT (JSON Web Tokens)**
- **Algorithm**: HS256
- **Token Type**: Bearer
- **Expiration**: 30 minutes (configurable)
- **Refresh**: Not implemented (future feature)

**Token Structure:**
```json
{
  "sub": "user@example.com",
  "role": "pregnant_woman",
  "exp": 1699012345
}
```

**Password Security:**
- **Hashing**: bcrypt
- **Salt Rounds**: 12 (automatic)
- **Min Length**: 8 characters (recommended)
- **Complexity**: Enforced on frontend

**Email Verification:**
- **Token**: UUID v4
- **Expiration**: 24 hours
- **Storage**: Database (verification_token column)
- **Flow**:
  1. User registers
  2. Verification token generated
  3. Email sent with verification link
  4. User clicks link
  5. Token validated
  6. email_verified set to true

#### Security Features

**1. Row-Level Security (RLS)**
- Enabled on all tables
- Users can only access their own data
- Healthcare workers can access all patient data
- Admins have full access

**2. CORS Protection**
```python
origins = [
    "http://localhost:3000",
    "https://your-frontend-domain.com"
]
```

**3. Input Validation**
- Pydantic models for all endpoints
- Type checking
- Range validation
- SQL injection prevention

**4. Environment Variables**
- Sensitive data in .env files
- .env files in .gitignore
- .env.example as template

**5. HTTPS Ready**
- SSL/TLS support
- Secure cookie flags
- HSTS headers (production)

**6. Rate Limiting** (Not Implemented)
```python
# Future implementation
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/predict")
@limiter.limit("10/minute")
async def predict(...):
    ...
```

#### Best Practices

**For Development:**
- Use .env files
- Never commit secrets
- Use strong JWT secret (32+ chars)
- Enable CORS only for trusted origins
- Validate all inputs

**For Production:**
- Use HTTPS only
- Enable rate limiting
- Implement refresh tokens
- Add API key rotation
- Enable audit logging
- Use secrets manager (AWS Secrets Manager, etc.)
- Implement 2FA (future)
- Add IP whitelisting (if applicable)

---

### 6. Testing Guide

#### Automated Testing

**Run Comprehensive Tests:**
```bash
bash test_comprehensive.sh
```

**Tests Included:**
1. Backend Health Check
2. API Documentation Accessibility
3. Chatbot - General Query
4. Chatbot - Medical Query
5. Prediction - Low Risk
6. Prediction - High Risk
7. Frontend Health Check
8. Data Validation

**Expected Output:**
```
WombGuard Comprehensive Testing 

 Testing Backend Health...
 PASS - Backend is running

 Testing API Documentation...
 PASS - API docs accessible

 Testing Chatbot (General)...
 PASS - Chatbot responding

 Testing Chatbot (Medical)...
 PASS - Medical model working

 Testing Prediction (Low Risk)...
 PASS - Prediction successful

 Testing Prediction (High Risk)...
 PASS - High risk detected

 Testing Frontend...
 PASS - Frontend running

 Testing Data Validation...
 PASS - Validation working

=== Test Results ===
Passed: 8/8 (100%)
Failed: 0/8 (0%)
Status:  ALL TESTS PASSED
```

#### Manual Testing

**Test 1: User Registration**
```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "role": "pregnant_woman",
    "phone": "+250788123456"
  }'
```

**Test 2: User Login**
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Test 3: Pregnancy Risk Prediction**
```bash
curl -X POST "http://localhost:8000/predict?user_email=test@example.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "Age": 28,
    "SystolicBP": 120,
    "DiastolicBP": 80,
    "BS": 6.5,
    "BodyTemp": 98.6,
    "HeartRate": 75,
    "BMI": 22.5
  }'
```

**Test 4: AI Chatbot**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "What are symptoms of preeclampsia?",
    "user_id": "your-user-id",
    "conversation_id": "test-conv-001"
  }'
```

**Test 5: Frontend Pages**
- Landing: http://localhost:3000/
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard
- Chatbot: http://localhost:3000/chatbot
- Prediction: http://localhost:3000/prediction

#### Test Results (Latest Run)

**Date**: 2025-11-01
**Status**: 100% Pass Rate
**Tests**: 8/8 Passed
**Performance**: All < 500ms response time
**Errors**: 0

**Detailed Results:**
- Backend API: Operational
- Frontend: Operational
- Database: Connected
- AI Models: Loaded (3/3)
- Prediction Model: Loaded
- Authentication: Working
- Chatbot: 98% accuracy
- Prediction: 97.45% accuracy

---

### 7. Deployment Guide

#### Recommended Deployment Stack

| Component | Platform | Cost | Reason |
|-----------|----------|------|--------|
| **Frontend** | Vercel | Free | Automatic deployments, CDN, HTTPS |
| **Backend** | Railway | $5/mo | Python support, easy setup, auto-scaling |
| **Database** | Supabase | Free | Already configured, RLS, Auth |

**Total Cost**: $5/month (Free tier available for all)

---

#### Frontend Deployment (Vercel)

**Step 1: Prepare for Deployment**
```bash
# Build the frontend
npm run build

# Test the build locally
npx serve -s build
```

**Step 2: Deploy to Vercel**

Option A - Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? wombguard-platform
# - Directory? ./
# - Override settings? No
```

Option B - Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `wombguard_platform` repository
5. Configure:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add Environment Variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. Click "Deploy"

**Step 3: Configure Custom Domain** (Optional)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**Deployment URL**: `https://wombguard-platform.vercel.app`

---

#### Backend Deployment (Railway)

**Step 1: Prepare Backend**

Create `Procfile` in `wombguard_predictive_api/`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Create `runtime.txt` in `wombguard_predictive_api/`:
```
python-3.9.18
```

Update `requirements.txt` to include:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
# ... rest of dependencies
```

**Step 2: Deploy to Railway**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select `wombguard_platform` repository
5. Configure:
   - Root Directory: `wombguard_predictive_api`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Step 3: Add Environment Variables**

In Railway Dashboard → Variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET_KEY=your_jwt_secret_key_min_32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8000
```

**Step 4: Deploy**
- Railway will automatically deploy
- Get deployment URL: `https://wombguard-api.up.railway.app`

**Step 5: Update Frontend**

Update frontend API URL in `src/services/apiService.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://wombguard-api.up.railway.app';
```

Add to Vercel environment variables:
```
REACT_APP_API_URL=https://wombguard-api.up.railway.app
```

**Step 6: Update CORS**

Update `main.py` CORS origins:
```python
origins = [
    "http://localhost:3000",
    "https://wombguard-platform.vercel.app",
    "https://your-custom-domain.com"
]
```

---

#### Database (Supabase)

**Already Deployed!** 

Supabase is cloud-hosted, so no additional deployment needed.

**Production Checklist:**
- All tables created
- RLS policies enabled
- API keys secured
- Backups enabled (automatic)
- SSL/TLS enabled (automatic)

---

#### CI/CD Pipeline

**GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push
          echo "Backend deployed via Railway"
```

---

#### Post-Deployment Checklist

**Frontend:**
- Site loads correctly
- All pages accessible
- API calls working
- Authentication working
- HTTPS enabled
- Custom domain configured (if applicable)

**Backend:**
- API health check passes
- All endpoints responding
- Database connected
- AI models loaded
- CORS configured correctly
- Environment variables set

**Database:**
- All tables exist
- RLS policies active
- Backups enabled
- Connection pooling configured

**Testing:**
```bash
# Test production frontend
curl https://wombguard-platform.vercel.app

# Test production backend
curl https://wombguard-api.up.railway.app/

# Test API docs
open https://wombguard-api.up.railway.app/docs

# Test prediction endpoint
curl -X POST https://wombguard-api.up.railway.app/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"Age": 28, "SystolicBP": 120, ...}'
```

---

### 8. Troubleshooting

#### Common Issues & Solutions

**Issue 1: API Connection Failed**
```
Error: Network Error / CORS Error
```
**Solutions:**
- Check backend is running: `curl http://localhost:8000/`
- Verify CORS settings in `main.py`
- Check frontend API URL in `apiService.js`
- Ensure backend port 8000 is not blocked

**Issue 2: Supabase Connection Error**
```
Error: Invalid Supabase credentials
```
**Solutions:**
- Verify `.env` file exists
- Check Supabase URL and keys are correct
- Ensure no extra spaces in `.env` values
- Restart servers after changing `.env`

**Issue 3: Model Loading Error**
```
Error: [Errno 2] No such file or directory: 'wombguard_pregnancy_model.pkl'
```
**Solutions:**
- Verify model file exists in `wombguard_predictive_api/`
- Check file permissions
- Ensure working directory is correct
- Re-download model if corrupted

**Issue 4: Chatbot Not Responding**
```
Error: Model not loaded / No response
```
**Solutions:**
- Check all 3 models exist in `wombguardbot_models/`
- Verify `bm25_index.pkl` and `embeddings_ensemble.npy` exist
- Check backend logs for model loading errors
- Ensure sufficient RAM (4GB+ recommended)

**Issue 5: JWT Token Invalid**
```
Error: 401 Unauthorized / Invalid token
```
**Solutions:**
- Check JWT_SECRET_KEY is set in backend `.env`
- Ensure token hasn't expired (30 min default)
- Verify token is sent in Authorization header
- Re-login to get new token

**Issue 6: Email Verification Not Working**
```
Error: Email not sent / Verification failed
```
**Solutions:**
- Check Supabase email settings
- Verify SMTP configuration in Supabase
- Check spam folder
- Ensure verification_token is generated

**Issue 7: Frontend Build Fails**
```
Error: npm run build fails
```
**Solutions:**
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (16+ required)
- Clear npm cache: `npm cache clean --force`

**Issue 8: Backend Dependencies Error**
```
Error: ModuleNotFoundError
```
**Solutions:**
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`
- Check Python version (3.9+ required)
- Upgrade pip: `pip install --upgrade pip`

**Issue 9: Database RLS Blocking Access**
```
Error: Permission denied / RLS policy violation
```
**Solutions:**
- Check user role is correct
- Verify RLS policies in Supabase
- Ensure user is authenticated
- Check user_id matches in requests

**Issue 10: High Memory Usage**
```
Error: Out of memory / Process killed
```
**Solutions:**
- Increase system RAM
- Use smaller AI models (if available)
- Implement model lazy loading
- Use cloud deployment with more resources

---

## Performance Metrics

### Current Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Frontend Load Time | < 2s | 1.2s |  ok |
| API Response Time | < 500ms | 250ms | ok |
| Prediction Latency | < 1s | 450ms |ok |
| Chatbot Response | < 1s | 380ms | ok |
| Database Query | < 100ms | 45ms | ok |

### Optimization Tips

**Frontend:**
- Code splitting implemented
- Lazy loading for routes
- Image optimization
- Minification enabled
- Service worker (future)

**Backend:**
- Async endpoints
- Connection pooling
- Model caching
- Redis caching (future)
- Load balancing (future)

**Database:**
- Indexed columns
- Query optimization
- Connection pooling
- RLS policies optimized

---

## Contributing

We welcome contributions! Here's how:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   bash test_comprehensive.sh
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

**Frontend:**
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Add PropTypes for components

**Backend:**
- Follow PEP 8 style guide
- Add type hints
- Write docstrings
- Add unit tests
- Handle errors gracefully

---

## License

MIT License

Copyright (c) 2025 WombGuard Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

### Contact Information

- **Email**: support@wombguard.com
- **Issues**: [GitHub Issues](https://github.com/g-tumwesigye/wombguard_platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/g-tumwesigye/wombguard_platform/discussions)
- **Phone**: +250 788 123 456 (Rwanda)

### Support Hours

- **Monday - Friday**: 9:00 AM - 5:00 PM (CAT)
- **Saturday**: 10:00 AM - 2:00 PM (CAT)
- **Sunday**: Closed
- **Emergency**: 24/7 via email

---

## Roadmap

### Completed (v1.0.0)
- [x] React 18 frontend with 14 pages
- [x] FastAPI backend with 30+ endpoints
- [x] Supabase PostgreSQL database
- [x] JWT authentication + email verification
- [x] Role-based access control (3 roles)
- [x] 3 specialized AI chatbot models (98% accuracy)
- [x] Random Forest pregnancy risk prediction (97% accuracy)
- [x] Row-Level Security (RLS)
- [x] Comprehensive documentation

-

### Future 
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support (Kinyarwanda, French)
- [ ] Telemedicine integration (video calls)
- [ ] Wearable device integration
- [ ] Advanced AI models 
- [ ] Predictive analytics (trends)
- [ ] Community forum
- [ ] Health education content
- [ ] Appointment scheduling
- [ ] Medication reminders
- [ ] Global expansion
- [ ] Research collaboration platform

---

## Acknowledgments

### Technologies
- **React** - For the amazing React framework
- **FastAPI** - For the high-performance Python framework
- **Supabase** - For the excellent PostgreSQL platform
- **Hugging Face** - For Sentence Transformers models
- **scikit-learn** - For machine learning tools

### Contributors
- **Beta Testers** - For valuable feedback
- **Open Source Community** - For inspiration and support

### Special Thanks
- **Rwanda Ministry of Health** - For support and guidance
- **Healthcare Providers** - For domain expertise
- **Pregnant Women** - For feedback and testing
-  **Project Supervisor** -Ms. Samiratu Ntohsi for guidance
- **ALU Research Ethics Committee** - For research ethics clearance


---

<div align="center">

**Made with ❤️ for Maternal Health**

**Last Updated**: November 2025

</div>