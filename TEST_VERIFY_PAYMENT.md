# Testing /verify-payment Endpoint in Postman

## Method 1: Generate Test Signature (Easiest)

### Step 1: Create an Order
```
POST http://localhost:8000/api/payment/create-order

Headers:
Content-Type: application/json

Body:
{
  "amount": 500,
  "plan_name": "Pro"
}

Response:
{
  "order_id": "order_xxxxx",  // SAVE THIS
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_test_xxxxx"
}
```

### Step 2: Generate Test Signature
```
POST http://localhost:8000/api/payment/generate-test-signature?order_id=order_xxxxx&payment_id=pay_test123

Response:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_test123",
  "razorpay_signature": "generated_signature_hash",
  "message": "Use these values in verify-payment endpoint"
}
```

### Step 3: Verify Payment
```
POST http://localhost:8000/api/payment/verify-payment

Headers:
Content-Type: application/json

Body:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_test123",
  "razorpay_signature": "generated_signature_hash",
  "user_id": "your_user_id_here"
}

Response:
{
  "success": true,
  "message": "Payment verified and user upgraded to premium",
  "user_type": "premium"
}
```

---

## Method 2: Manual Signature Generation (Python Script)

Create a file `generate_signature.py`:

```python
import hmac
import hashlib

# Your values
order_id = "order_xxxxx"  # From create-order response
payment_id = "pay_test123"  # Any test payment ID
secret_key = "your_razorpay_secret_key"  # From .env

# Generate signature
message = f"{order_id}|{payment_id}"
signature = hmac.new(
    secret_key.encode(),
    message.encode(),
    hashlib.sha256
).hexdigest()

print(f"Order ID: {order_id}")
print(f"Payment ID: {payment_id}")
print(f"Signature: {signature}")
```

Run: `python generate_signature.py`

Then use the output in Postman.

---

## Method 3: Using Razorpay Test Mode (Most Realistic)

### Step 1: Create Order (same as Method 1)

### Step 2: Complete Payment via Razorpay Checkout
You need to integrate Razorpay checkout in your frontend or use their test page:

1. Go to Razorpay Dashboard → Test Mode
2. Use test card: `4111 1111 1111 1111`
3. Expiry: Any future date
4. CVV: Any 3 digits

After payment, Razorpay will return:
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

### Step 3: Use those values in verify-payment endpoint

---

## Complete Testing Flow in Postman

### 1. Get User ID
```
POST http://localhost:8000/api/auth/signup
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "name": "Test User"
}
```
**Save the user `id`**

### 2. Create Order
```
POST http://localhost:8000/api/payment/create-order
Body: {
  "amount": 500,
  "plan_name": "Pro"
}
```
**Save the `order_id`**

### 3. Generate Signature
```
POST http://localhost:8000/api/payment/generate-test-signature?order_id=ORDER_ID&payment_id=pay_test123
```
**Copy all values from response**

### 4. Verify Payment
```
POST http://localhost:8000/api/payment/verify-payment
Body: {
  "razorpay_order_id": "from_step_3",
  "razorpay_payment_id": "from_step_3",
  "razorpay_signature": "from_step_3",
  "user_id": "from_step_1"
}
```

### 5. Check Status
```
GET http://localhost:8000/api/payment/subscription-status/USER_ID
```
Should show `"type_of_user": "premium"`

---

## Testing Invalid Signature

To test error handling:

```
POST http://localhost:8000/api/payment/verify-payment
Body: {
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_test123",
  "razorpay_signature": "invalid_signature_12345",
  "user_id": "your_user_id"
}

Expected Response:
{
  "detail": "Invalid payment signature"
}
```

---

## ⚠️ Important Notes

1. **Remove test endpoints before production:**
   - `/test-upgrade`
   - `/generate-test-signature`

2. **Environment Variables Required:**
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_SECRET_KEY=your_secret_key
   ```

3. **Signature Format:**
   - Message: `order_id|payment_id`
   - Algorithm: HMAC SHA256
   - Key: Razorpay Secret Key

4. **Common Errors:**
   - "Invalid payment signature" → Wrong signature or secret key
   - "User not found" → Invalid user_id
   - 500 error → Check Razorpay credentials in .env
