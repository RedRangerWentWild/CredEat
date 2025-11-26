from fastapi import APIRouter, Depends
from database import db
from dependencies import get_admin_user, UserResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/wastage")
async def get_wastage_stats(admin: UserResponse = Depends(get_admin_user)):
    # Simple aggregation: Count skipped meals vs total meals
    total_meals = await db.meals.count_documents({})
    total_selections = await db.meal_selections.count_documents({})
    skipped_count = await db.meal_selections.count_documents({"status": "skipped"})
    
    # Mock data for the graph if empty
    if total_selections == 0:
        return {
            "total_meals_served": 1200,
            "meals_skipped": 150,
            "wastage_saved_kg": 45.5,
            "participation_rate": 88
        }
        
    return {
        "total_meals_served": total_selections,
        "meals_skipped": skipped_count,
        "wastage_saved_kg": skipped_count * 0.3, # Assuming 0.3kg per meal
        "participation_rate": ((total_selections - skipped_count) / total_selections) * 100 if total_selections > 0 else 0
    }

@router.get("/monthly")
async def get_monthly_stats(admin: UserResponse = Depends(get_admin_user)):
    # In a real app, we would aggregate by month using MongoDB aggregation pipeline
    # For MVP/Hackathon, we'll return mock data structure that Recharts can consume
    
    # Mock Data Structure
    data = [
        {"name": "Jan", "complaints": 4, "food_saved_kg": 20, "hygiene_rating": 4.2},
        {"name": "Feb", "complaints": 3, "food_saved_kg": 25, "hygiene_rating": 4.5},
        {"name": "Mar", "complaints": 6, "food_saved_kg": 30, "hygiene_rating": 3.8},
        {"name": "Apr", "complaints": 2, "food_saved_kg": 28, "hygiene_rating": 4.7},
        {"name": "May", "complaints": 5, "food_saved_kg": 35, "hygiene_rating": 4.0},
        {"name": "Jun", "complaints": 1, "food_saved_kg": 40, "hygiene_rating": 4.9},
    ]
    
    # Try to get some real data if available to mix in?
    # For now, static mock is safer for the graph demo
    return data
