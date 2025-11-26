from fastapi import APIRouter, HTTPException, Depends
from database import db
from models import Transaction, UserResponse
from dependencies import get_current_user
from datetime import datetime, timezone
from pydantic import BaseModel

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.get("/", response_model=dict)
async def get_wallet(current_user: UserResponse = Depends(get_current_user)):
    # Get fresh balance
    user = await db.users.find_one({"email": current_user.email})
    
    transactions = await db.transactions.find(
        {"$or": [{"sender_id": current_user.id}, {"receiver_id": current_user.id}]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    return {
        "balance": user['wallet_balance'],
        "transactions": transactions
    }

class PayVendorRequest(BaseModel):
    vendor_id: str
    amount: float

@router.post("/pay")
async def pay_vendor(req: PayVendorRequest, current_user: UserResponse = Depends(get_current_user)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
        
    # Check balance
    user = await db.users.find_one({"email": current_user.email})
    if user['wallet_balance'] < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    # Check vendor
    vendor = await db.users.find_one({"id": req.vendor_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    # Execute Transfer
    # 1. Deduct from student
    await db.users.update_one(
        {"email": current_user.email},
        {"$inc": {"wallet_balance": -req.amount}}
    )
    
    # 2. Add to vendor
    await db.users.update_one(
        {"id": req.vendor_id},
        {"$inc": {"wallet_balance": req.amount}}
    )
    
    # 3. Log Transaction
    tx = Transaction(
        sender_id=current_user.id,
        receiver_id=req.vendor_id,
        amount=req.amount,
        type="vendor_payment",
        description=f"Payment to {vendor['full_name']}"
    )
    tx_dict = tx.model_dump()
    tx_dict['timestamp'] = tx_dict['timestamp'].isoformat()
    await db.transactions.insert_one(tx_dict)
    
    return {"status": "success", "transaction_id": tx.id}

class WithdrawRequest(BaseModel):
    amount: float

@router.post("/withdraw")
async def withdraw_funds(req: WithdrawRequest, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can withdraw funds")
        
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
        
    # Check balance
    user = await db.users.find_one({"email": current_user.email})
    if user['wallet_balance'] < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    # Deduct from vendor
    await db.users.update_one(
        {"email": current_user.email},
        {"$inc": {"wallet_balance": -req.amount}}
    )
    
    # Log Transaction
    tx = Transaction(
        sender_id=current_user.id,
        receiver_id="SYSTEM", # Sending back to system/bank
        amount=req.amount,
        type="withdrawal", # New type
        description=f"Weekly Withdrawal Request"
    )
    tx_dict = tx.model_dump()
    tx_dict['timestamp'] = tx_dict['timestamp'].isoformat()
    await db.transactions.insert_one(tx_dict)
    
    return {"status": "success", "transaction_id": tx.id, "message": "Withdrawal processed successfully"}
