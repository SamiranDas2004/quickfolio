# Quick Postman Testing Guide for Payment APIs

## 1. Test Upgrade (Easiest - No Razorpay needed)

**Endpoint:** `POST http://localhost:8000/api/payment/test-upgrade`

**Query Parameters:**
- `user_id`: Your user ID (required)
- `plan`: premium, pro, or starter (optional, default: premium)

**Example:**
```
POST http://localhost:8000/api/payment/test-upgrade?user_id=123e4567-e89b-12d3-a456-426614174000&plan=premium
```

**Response:**
```json
{
  "success": true,
  "message": "User upgraded to premium (TEST MODE)",
  "user_type": "premium"
}
```

---

## 2. Create Order

**Endpoint:** `POST http://localhost:8000/api/payment/create-order`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 500,
  "plan_name": "Pro"
}
```

**Response:**
```json
{
  "order_id": "order_xxxxx",
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_test_xxxxx"
}
```

---

## 3. Check Subscription Status

**Endpoint:** `GET http://localhost:8000/api/payment/subscription-status/{user_id}`

**Example:**
```
GET http://localhost:8000/api/payment/subscription-status/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "type_of_user": "premium",
  "subscription_date": "2024-01-15T10:30:00"
}
```

---

## Testing Flow

### Step 1: Get User ID
First, signup or login to get a user ID:

```
POST http://localhost:8000/api/auth/signup
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "name": "Test User"
}
```

Copy the user `id` from response.

### Step 2: Upgrade User (Test Mode)
```
POST http://localhost:8000/api/payment/test-upgrade?user_id=YOUR_USER_ID&plan=premium
```

### Step 3: Verify Upgrade
```
GET http://localhost:8000/api/payment/subscription-status/YOUR_USER_ID
```

Should show `"type_of_user": "premium"`

---

## Testing Real Payment Flow

For testing actual Razorpay payment verification:

1. **Create Order** (Step 2 above)
2. **Complete Payment** on Razorpay test mode:
   - Card: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
3. **Verify Payment:**

```
POST http://localhost:8000/api/payment/verify-payment
Body: {
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_from_razorpay",
  "user_id": "your_user_id"
}
```

---

## ⚠️ Important Notes

- The `/test-upgrade` endpoint is for **TESTING ONLY**
- Remove it before deploying to production
- For production, always use `/verify-payment` with real Razorpay signatures
