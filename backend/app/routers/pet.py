from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.pet import Pet, PetStats, PetHomeItem
from ..models.user import UserStats
from ..config import PET_DECAY_INTERVAL_HOURS, PET_DECAY_RATE, PET_MAX_DECAY_CYCLES

router = APIRouter(prefix="/api/v1/pet", tags=["pet"])


def get_or_create_pet(db: Session) -> tuple[Pet, PetStats]:
    pet = db.query(Pet).filter(Pet.id == 1).first()
    stats = db.query(PetStats).filter(PetStats.id == 1).first()
    if not pet:
        pet = Pet(id=1)
        db.add(pet)
    if not stats:
        stats = PetStats(id=1)
        db.add(stats)
    db.commit()
    db.refresh(pet)
    db.refresh(stats)
    return pet, stats


def apply_decay(stats: PetStats):
    """根据时间差计算衰减"""
    if not stats.last_updated:
        stats.last_updated = datetime.utcnow()
        return
    now = datetime.utcnow()
    hours_passed = (now - stats.last_updated).total_seconds() / 3600
    cycles = min(hours_passed / PET_DECAY_INTERVAL_HOURS, PET_MAX_DECAY_CYCLES)
    stats.hunger = max(0, stats.hunger - cycles * PET_DECAY_RATE)
    stats.happiness = max(0, stats.happiness - cycles * PET_DECAY_RATE)
    stats.energy = max(0, stats.energy - cycles * (PET_DECAY_RATE * 0.5))
    stats.cleanliness = max(0, stats.cleanliness - cycles * (PET_DECAY_RATE * 0.8))
    stats.last_updated = now


def check_sick(stats: PetStats):
    stats.is_sick = 1 if any(
        s <= 0 for s in [stats.hunger, stats.happiness, stats.energy, stats.cleanliness]
    ) else 0


@router.get("")
def get_pet_info(db: Session = Depends(get_db)):
    pet, stats = get_or_create_pet(db)
    apply_decay(stats)
    check_sick(stats)
    db.commit()
    return {
        "species": pet.species,
        "pet_name": pet.pet_name,
        "evolution_stage": pet.evolution_stage,
        "level": pet.level,
        "skin_id": pet.skin_id,
        "stats": {
            "hunger": round(stats.hunger, 1),
            "happiness": round(stats.happiness, 1),
            "energy": round(stats.energy, 1),
            "cleanliness": round(stats.cleanliness, 1),
            "is_sick": bool(stats.is_sick),
        },
    }


@router.post("/feed")
def feed_pet(db: Session = Depends(get_db)):
    pet, stats = get_or_create_pet(db)
    apply_decay(stats)
    user = db.query(UserStats).filter(UserStats.id == 1).first()
    if not user or user.coins < 10:
        return {"success": False, "message": "金币不够"}
    user.coins -= 10
    stats.hunger = min(100, stats.hunger + 25)
    stats.last_updated = datetime.utcnow()
    check_sick(stats)
    db.commit()
    return {"success": True, "stats": {
        "hunger": round(stats.hunger, 1),
        "happiness": round(stats.happiness, 1),
        "energy": round(stats.energy, 1),
        "cleanliness": round(stats.cleanliness, 1),
    }, "coins_left": user.coins}


@router.post("/play")
def play_pet(db: Session = Depends(get_db)):
    pet, stats = get_or_create_pet(db)
    apply_decay(stats)
    user = db.query(UserStats).filter(UserStats.id == 1).first()
    if not user or user.coins < 15:
        return {"success": False, "message": "金币不够"}
    user.coins -= 15
    stats.happiness = min(100, stats.happiness + 25)
    stats.last_updated = datetime.utcnow()
    check_sick(stats)
    db.commit()
    return {"success": True, "stats": {
        "hunger": round(stats.hunger, 1),
        "happiness": round(stats.happiness, 1),
        "energy": round(stats.energy, 1),
        "cleanliness": round(stats.cleanliness, 1),
    }, "coins_left": user.coins}


@router.post("/clean")
def clean_pet(db: Session = Depends(get_db)):
    pet, stats = get_or_create_pet(db)
    apply_decay(stats)
    user = db.query(UserStats).filter(UserStats.id == 1).first()
    if not user or user.coins < 5:
        return {"success": False, "message": "金币不够"}
    user.coins -= 5
    stats.cleanliness = min(100, stats.cleanliness + 30)
    stats.last_updated = datetime.utcnow()
    check_sick(stats)
    db.commit()
    return {"success": True, "stats": {
        "hunger": round(stats.hunger, 1),
        "happiness": round(stats.happiness, 1),
        "energy": round(stats.energy, 1),
        "cleanliness": round(stats.cleanliness, 1),
    }, "coins_left": user.coins}


@router.post("/sleep")
def sleep_pet(db: Session = Depends(get_db)):
    pet, stats = get_or_create_pet(db)
    apply_decay(stats)
    stats.energy = 100
    stats.last_updated = datetime.utcnow()
    check_sick(stats)
    db.commit()
    return {"success": True, "stats": {
        "hunger": round(stats.hunger, 1),
        "happiness": round(stats.happiness, 1),
        "energy": round(stats.energy, 1),
        "cleanliness": round(stats.cleanliness, 1),
    }}


@router.get("/shop")
def get_shop(db: Session = Depends(get_db)):
    items = db.query(PetHomeItem).order_by(PetHomeItem.sort_order).all()
    return [{
        "id": i.id,
        "item_type": i.item_type,
        "item_name": i.item_name,
        "item_cost": i.item_cost,
        "equipped": bool(i.equipped),
        "purchased": bool(i.purchased),
    } for i in items]


class BuyItem(BaseModel):
    item_id: int


@router.post("/shop/buy")
def buy_item(data: BuyItem, db: Session = Depends(get_db)):
    item = db.query(PetHomeItem).filter(PetHomeItem.id == data.item_id).first()
    if not item:
        return {"success": False, "message": "商品不存在"}
    if item.purchased:
        return {"success": False, "message": "已拥有"}
    user = db.query(UserStats).filter(UserStats.id == 1).first()
    if not user or user.coins < item.item_cost:
        return {"success": False, "message": "金币不够"}
    user.coins -= item.item_cost
    item.purchased = 1
    db.commit()
    return {"success": True, "item": item.item_name, "coins_left": user.coins}
