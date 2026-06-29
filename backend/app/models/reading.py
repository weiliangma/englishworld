from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from ..database import Base


class ReadingTowerFloor(Base):
    __tablename__ = "reading_tower_floors"
    id = Column(Integer, primary_key=True, index=True)
    floor_number = Column(Integer, nullable=False)
    difficulty = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    passage_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    word_hints = Column(Text, default=None)  # JSON
    fun_fact = Column(Text, default=None)
    is_boss = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReadingQuestion(Base):
    __tablename__ = "reading_questions"
    id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(Integer, ForeignKey("reading_tower_floors.id"))
    question_type = Column(String(20), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON
    correct_answer = Column(String(10), nullable=False)
    explanation = Column(Text, default=None)
    sort_order = Column(Integer, default=0)
