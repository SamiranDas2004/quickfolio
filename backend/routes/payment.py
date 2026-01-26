from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
import razorpay
import os
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()

razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_SECRET_KEY")))

class CreateOrderRequest(BaseModel):
    amount: int
    plan_name: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str

@router.post("/create-order")
async def create_order(request: CreateOrderRequest):
    print(f"\n=== CREATE ORDER ===")
    print(f"Plan: {request.plan_name}")
    print(f"Amount: ₹{request.amount}")
    
    try:
        amount_in_paise = request.amount * 100
        
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"plan_name": request.plan_name}
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        print(f"Order created: {order['id']}")
        print(f"Amount in paise: {order['amount']}")
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": os.getenv("RAZORPAY_KEY_ID")
        }
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(request: VerifyPaymentRequest, db: Session = Depends(get_db)):
    print(f"\n=== VERIFY PAYMENT ===")
    print(f"Order ID: {request.razorpay_order_id}")
    print(f"Payment ID: {request.razorpay_payment_id}")
    print(f"User ID: {request.user_id}")
    
    try:
        params_dict = {
            "razorpay_order_id": request.razorpay_order_id,
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        print("✓ Signature verified successfully")
        
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            print(f"✗ User not found: {request.user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"User found: {user.username}")
        print(f"Previous plan: {user.type_of_user}")
        
        user.type_of_user = "premium"
        user.subscription_date = datetime.utcnow()
        user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
        print(f"Setting subscription_end_date to {user.subscription_end_date}")
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✓ User upgraded to premium")
        print(f"Subscription date: {user.subscription_date}")
        print(f"Checking DB commit...")
        
        # Verify the data was saved
        db_user = db.query(User).filter(User.id == request.user_id).first()
        print(f"DB verification - type_of_user: {db_user.type_of_user}")
        print(f"DB verification - subscription_date: {db_user.subscription_date}")
        print(f"DB verification - subscription_end_date: {db_user.subscription_end_date}")
        
        return {
            "success": True,
            "message": "Payment verified and user upgraded to premium",
            "user_type": "premium"
        }
    except razorpay.errors.SignatureVerificationError:
        print("✗ Invalid payment signature")
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-upgrade")
async def test_upgrade(user_id: str, plan: str = "premium", db: Session = Depends(get_db)):
    """FOR TESTING ONLY - Upgrade user without payment verification"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.type_of_user = plan
    user.subscription_date = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": f"User upgraded to {plan} (TEST MODE)",
        "user_type": plan
    }

@router.post("/generate-test-signature")
async def generate_test_signature(order_id: str, payment_id: str):
    """FOR TESTING ONLY - Generate valid Razorpay signature for testing"""
    import hmac
    import hashlib
    
    secret = os.getenv("RAZORPAY_SECRET_KEY")
    message = f"{order_id}|{payment_id}"
    signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    
    return {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature,
        "message": "Use these values in verify-payment endpoint"
    }

@router.get("/subscription-status/{user_id}")
async def get_subscription_status(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "type_of_user": user.type_of_user,
        "subscription_date": user.subscription_date
    }
