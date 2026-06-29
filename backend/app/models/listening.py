from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from ..database import Base


class ListeningPassage(Base):
    __tablename__ = "listening_passages"
    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(20), nullable=False)
    channel_display = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    difficulty = Column(Integer, default=1)
    audio_file = Column(String(200), nullable=False)
    transcript = Column(Text, nullable=False)
    duration_seconds = Column(Integer, default=0)
    word_hints = Column(Text, default=None)
    play_count_limit = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)


class ListeningQuestion(Base):
    __tablename__ = "listening_questions"
    id = Column(Integer, primary_key=True, index=True)
    passage_id = Column(Integer, ForeignKey("listening_passages.id"))
    question_type = Column(String(30), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False)
    correct_answer = Column(String(10), nullable=False)
    image_file = Column(String(200), default=None)
    explanation = Column(Text, default=None)
    sort_order = Column(Integer, default=0)
