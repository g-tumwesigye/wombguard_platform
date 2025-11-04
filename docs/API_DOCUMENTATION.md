# WombGuard API Documentation

## Base URL
```
http://localhost:8000
```

---

## Authentication

All endpoints marked with ✅ require authentication. Include the user email as a query parameter:
```
?user_email=user@example.com
```

---

## Endpoints

### 1. User Registration
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "role": "pregnant_woman"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "pregnant_woman"
  }
}
```

**Error (400):**
```json
{
  "detail": "Email already registered"
}
```

---

### 2. User Login
**POST** `/login`

Authenticate user and get session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "pregnant_woman"
  }
}
```

**Error (401):**
```json
{
  "detail": "Invalid email or password"
}
```

---

### 3. Risk Prediction ✅
**POST** `/predict`

Get pregnancy risk prediction with SHAP explanations.

**Query Parameters:**
- `user_email` (required) - User's email address

**Request Body:**
```json
{
  "Age": 25,
  "Systolic_BP": 120,
  "Diastolic": 80,
  "BS": 100,
  "Body_Temp": 98.6,
  "BMI": 22,
  "Heart_Rate": 72
}
```

**Response (200):**
```json
{
  "prediction": {
    "Predicted_Risk_Level": "Low Risk",
    "Probability_High_Risk": 0.25,
    "Confidence_Score": 0.75
  },
  "explanation": {
    "feature_importance": {
      "Age": 0.15,
      "Systolic_BP": 0.25,
      "BMI": 0.20,
      "Heart_Rate": 0.18,
      "BS": 0.12,
      "Body_Temp": 0.08,
      "Diastolic": 0.02
    },
    "summary": "Top influencing factors: Blood Pressure (25%), BMI (20%), Heart Rate (18%)"
  }
}
```

**Error (400):**
```json
{
  "detail": "Missing required fields"
}
```

---

### 4. Dashboard Data ✅
**GET** `/dashboard`

Get user's dashboard statistics and data.

**Query Parameters:**
- `user_email` (required) - User's email address

**Response (200):**
```json
{
  "user_name": "Jane Doe",
  "role": "pregnant_woman",
  "total_predictions": 5,
  "last_prediction": "2025-10-26T10:30:00Z",
  "risk_level": "Low Risk",
  "recent_predictions": [
    {
      "id": "uuid",
      "predicted_risk": "Low Risk",
      "probability": 0.25,
      "created_at": "2025-10-26T10:30:00Z"
    }
  ],
  "chat_sessions": 12,
  "last_chat": "2025-10-26T09:15:00Z"
}
```

---

### 5. Send Chat Message ✅
**POST** `/chat`

Send a message to WombGuardBot.

**Query Parameters:**
- `user_email` (required) - User's email address

**Request Body:**
```json
{
  "message": "What should I eat during pregnancy?",
  "user_id": "user-uuid",
  "conversation_id": "conv-uuid-or-new"
}
```

**Response (200):**
```json
{
  "response": "During pregnancy, it's important to eat a balanced diet rich in...",
  "conversation_id": "conv-uuid",
  "timestamp": "2025-10-26T10:35:00Z"
}
```

**Error (500):**
```json
{
  "detail": "Chatbot service unavailable"
}
```

---

### 6. Chat History ✅
**GET** `/chat-history`

Retrieve user's chat history.

**Query Parameters:**
- `user_email` (required) - User's email address
- `conversation_id` (optional) - Filter by conversation

**Response (200):**
```json
{
  "conversations": [
    {
      "conversation_id": "conv-uuid-1",
      "title": "Nutrition Questions",
      "message_count": 5,
      "created_at": "2025-10-26T08:00:00Z",
      "messages": [
        {
          "id": "msg-uuid",
          "user_message": "What should I eat?",
          "bot_response": "During pregnancy...",
          "created_at": "2025-10-26T08:05:00Z"
        }
      ]
    }
  ]
}
```

---

### 7. Health Check
**GET** `/`

Check API health status.

**Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-26T10:40:00Z"
}
```

---

## Request/Response Format

### Headers
```
Content-Type: application/json
```

### Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **500** - Server Error

---

## Error Handling

All errors follow this format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing required fields | Check request body |
| 401 | Invalid credentials | Verify email/password |
| 404 | User not found | Register first |
| 500 | Server error | Check server logs |

---

## Data Types

### Risk Levels
- `Low Risk` - Probability < 0.33
- `Medium Risk` - Probability 0.33-0.66
- `High Risk` - Probability > 0.66

### User Roles
- `pregnant_woman` - Expectant mother
- `healthcare_provider` - Doctor/Nurse
- `admin` - System administrator

### Health Parameters
- **Age**: 15-50 (years)
- **Systolic_BP**: 80-180 (mmHg)
- **Diastolic**: 40-120 (mmHg)
- **BS**: 60-300 (mg/dL)
- **Body_Temp**: 95-105 (°F)
- **BMI**: 15-50 (kg/m²)
- **Heart_Rate**: 40-150 (bpm)

---

## Integration Examples

### JavaScript/Axios
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Predict
const response = await axios.post(`${API_URL}/predict`, {
  Age: 25,
  Systolic_BP: 120,
  Diastolic: 80,
  BS: 100,
  Body_Temp: 98.6,
  BMI: 22,
  Heart_Rate: 72
}, {
  params: { user_email: 'user@example.com' }
});
```

### Python/Requests
```python
import requests

API_URL = 'http://localhost:8000'

response = requests.post(
    f'{API_URL}/predict',
    json={
        'Age': 25,
        'Systolic_BP': 120,
        'Diastolic': 80,
        'BS': 100,
        'Body_Temp': 98.6,
        'BMI': 22,
        'Heart_Rate': 72
    },
    params={'user_email': 'user@example.com'}
)
```

### cURL
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 25,
    "Systolic_BP": 120,
    "Diastolic": 80,
    "BS": 100,
    "Body_Temp": 98.6,
    "BMI": 22,
    "Heart_Rate": 72
  }' \
  -G --data-urlencode "user_email=user@example.com"
```

---

## Rate Limiting

Currently no rate limiting. 
- 100 requests per minute per user
- 1000 requests per minute per IP


---

## Changelog

### v1.0.0 (October 2025)
- Initial API release
- User authentication
- Risk prediction
- Chat functionality
- Dashboard endpoints

---

## Support

For API issues:
1. Check error message in response
2. Verify request format
3. Check server logs
4. Contact support team

---

**Last Updated**: October 2025  
**Version**: 1.0.0

