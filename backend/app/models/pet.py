from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from datetime import datetime
from ..database import Base


class Pet(Base):
    __tablename__ = "pet"
    id = Column(Integer, primary_key=True, default=1)
    species = Column(String(20), default="dragon")
    pet_name = Column(String(50), default="小勇")
    evolution_stage = Column(Integer, default=1)
    level = Column(Integer, default=1)
    skin_id = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class PetStats(Base):
    __tablename__ = "pet_stats"
    id = Column(Integer, primary_key=True, default=1)
    hunger = Column(Float, default=80.0)
    happiness = Column(Float, default=80.0)
    energy = Column(Float, default=80.0)
    cleanliness = Column(Float, default=80.0)
    is_sick = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)


class PetHomeItem(Base):
    __tablename__ = "pet_home"
    id = Column(Integer, primary_key=True, index=True)
    item_type = Column(String(20), nullable=False)
    item_name = Column(String(100), nullable=False)
    item_cost = Column(Integer, nullable=False)
    equipped = Column(Integer, default=0)
    purchased = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)


class PetDialogue(Base):
    __tablename__ = "pet_dialogues"
    id = Column(Integer, primary_key=True, index=True)
    mood_condition = Column(Text, nullable=False)  # JSON
    dialogue = Column(Text, nullable=False)
    probability = Column(Float, default=1.0)
