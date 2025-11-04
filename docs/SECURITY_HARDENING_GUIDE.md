# Security Hardening Guide - Healthcare Grade

## Priority Security Improvements

### **1. API Rate Limiting** 

**Why**: Prevent abuse, DDoS attacks, brute force attempts

**Implementation**:
```bash
pip install slowapi
```

Add to `main.py`:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."}
    )

# Apply to endpoints
@app.post("/login")
@limiter.limit("5/minute")  
def login(user: UserLogin):
    ...

@app.post("/chat")
@limiter.limit("10/minute")  
def chat(message: ChatMessage):
    ...

@app.post("/predict")
@limiter.limit("20/minute")  
def predict(data: PatientData):
    ...
```

---

### **2. Input Validation & Sanitization** 

**Why**: Prevent XSS, SQL injection, malicious input

**Implementation**:
```bash
pip install bleach
```

Add to `main.py`:
```python
from bleach import clean
import re

def sanitize_text(text: str) -> str:
    """Remove HTML/script tags and dangerous content"""
    # Remove HTML tags
    text = clean(text, tags=[], strip=True)
    # Remove special characters
    text = re.sub(r'[<>\"\'%;()&+]', '', text)
    return text.strip()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Use in endpoints
@app.post("/chat")
def chat(message: ChatMessage):
    # Sanitize input
    clean_message = sanitize_text(message.message)
    if not clean_message:
        raise HTTPException(status_code=400, detail="Invalid message")
    ...
```

---

### **3. HTTPS & TLS** (CRITICAL)

**For Production**:
```bash
# Use Let's Encrypt for free SSL certificates
# Configure in your deployment (Heroku, AWS, etc.)
```

**Environment Variable**:
```
ENVIRONMENT=production
HTTPS_ONLY=true
```

---

### **4. CORS Security** (HIGH)

**Current (Too Permissive)**:
```python
allow_origins=["*"]  # ❌ Dangerous!
```

**Hardened**:
```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://wombguard.com",  # Production
    "https://www.wombguard.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600
)
```

---

### **5. Authentication & Authorization** (HIGH)

**Add JWT Tokens**:
```bash
pip install python-jose cryptography
```

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

### **6. Data Encryption** (HIGH)

**At Rest**:
```python
from cryptography.fernet import Fernet

cipher = Fernet(os.getenv("ENCRYPTION_KEY"))

def encrypt_sensitive_data(data: str) -> str:
    return cipher.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    return cipher.decrypt(encrypted_data.encode()).decode()
```

**In Transit**: Use HTTPS (TLS 1.2+)

---

### **7. Logging & Monitoring** (HIGH)

```python
import logging
from pythonjsonlogger import jsonlogger

# Structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Log security events
logger.warning(f"Failed login attempt: {email}")
logger.info(f"User {user_id} accessed sensitive data")
logger.error(f"Database error: {error}")
```

---

### **8. SQL Injection Prevention** (HIGH)

**Current (Safe - Using Supabase)**:
```python
# ✅ Parameterized queries (safe)
supabase.table("users").select("*").eq("email", email).execute()
```

**Never do this**:
```python
# ❌ String concatenation (vulnerable!)
query = f"SELECT * FROM users WHERE email = '{email}'"
```

---

### **9. GDPR Compliance** (MEDIUM)

**Add Data Export**:
```python
@app.get("/user/export-data")
def export_user_data(user_id: str):
    """Export all user data in JSON format"""
    try:
        user_data = supabase.table("users").select("*").eq("id", user_id).execute()
        predictions = supabase.table("predictions").select("*").eq("user_id", user_id).execute()
        chat_history = supabase.table("chat_history").select("*").eq("user_id", user_id).execute()
        
        return {
            "user": user_data.data,
            "predictions": predictions.data,
            "chat_history": chat_history.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/user/delete-account")
def delete_user_account(user_id: str):
    """Delete all user data (right to be forgotten)"""
    try:
        # Delete all related data
        supabase.table("predictions").delete().eq("user_id", user_id).execute()
        supabase.table("chat_history").delete().eq("user_id", user_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
        
        return {"status": "success", "message": "Account deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### **10. Environment Variables** (HIGH)

**Create `.env.production`**:
```
ENVIRONMENT=production
SECRET_KEY=your-very-long-random-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ENCRYPTION_KEY=your-encryption-key
ALLOWED_ORIGINS=https://wombguard.com,https://www.wombguard.com
HTTPS_ONLY=true
```

**Never commit secrets!**:
```bash
# Add to .gitignore
.env
.env.production
.env.local
```

---

## 🔒 Security Checklist

- [ ] Rate limiting enabled
- [ ] Input validation & sanitization
- [ ] HTTPS/TLS configured
- [ ] CORS restricted to known origins
- [ ] JWT authentication implemented
- [ ] Data encryption at rest
- [ ] Structured logging enabled
- [ ] SQL injection prevention verified
- [ ] GDPR compliance features added
- [ ] Environment variables secured
- [ ] Secrets not in version control
- [ ] Regular security audits scheduled
- [ ] Dependency vulnerabilities checked
- [ ] Error messages don't leak info
- [ ] Admin endpoints protected

---

## 🚀 Implementation Priority

1. **Week 1**: Rate limiting + Input validation
2. **Week 2**: CORS hardening + JWT tokens
3. **Week 3**: Data encryption + Logging
4. **Week 4**: GDPR features + Monitoring

---

**Healthcare data requires top-tier security! Implement these now! 🔐**

