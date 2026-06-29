from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class UserProfile(Base):
    __tablename__ = "user_profile"
    id = Column(Integer, primary_key=True, default=1)
    nickname = Column(String(50), default="语法勇士")
    pet_name = Column(String(50), default="小勇")
    created_at = Column(DateTime, default=datetime.utcnow)


class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(Integer, primary_key=True, default=1)
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    coins = Column(Integer, default=50)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_questions = Column(Integer, default=0)
    last_active_date = Column(String(10), default=None)
