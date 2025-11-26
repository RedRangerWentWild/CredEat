from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone
import uuid

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Literal["student", "vendor", "admin"] = "student"

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    wallet_balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(populate_by_name=True)

class UserResponse(UserBase):
    id: str
    wallet_balance: float
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Meal Models
class MealBase(BaseModel):
    date: str  # YYYY-MM-DD
    type: Literal["breakfast", "lunch", "dinner"]
    menu_items: List[str]
    price: float = 50.0  # Credit value
    is_active: bool = True

class MealCreate(MealBase):
    pass

class MealResponse(MealBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Meal Selection
class MealSelection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    meal_id: str
    status: Literal["attending", "skipped"]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Transaction
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: Optional[str] = None
    amount: float
    type: Literal["skip_credit", "vendor_payment", "admin_adjustment", "withdrawal"] # Added withdrawal
    description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Complaint
class ComplaintBase(BaseModel):
    category: Literal["hygiene", "quality", "other"]
    description: str
    image_url: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: Literal["pending", "resolved"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
