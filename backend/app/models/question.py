from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    display_name = Column(String(50), nullable=False)
    category = Column(String(20), nullable=False)  # grammar / vocab / reading / cloze
    difficulty = Column(Integer, default=1)
    unlock_requirement = Column(Text, default=None)  # JSON
    boss_name = Column(String(50), default=None)
    boss_hp = Column(Integer, default=10)
    sort_order = Column(Integer, default=0)


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    question_type = Column(String(50), nullable=False)
    difficulty = Column(Integer, default=1)
    content = Column(Text, nullable=False)  # JSON
    source = Column(String(20), default="manual")
    exam_year = Column(Integer, default=None)
    times_answered = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class StudyRecord(Base):
    __tablename__ = "study_records"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(String(200), nullable=False)
    is_correct = Column(Integer, default=0)
    time_spent = Column(Integer, default=0)  # milliseconds
    combo_at_time = Column(Integer, default=0)
    earned_coins = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class WrongBook(Base):
    __tablename__ = "wrong_book"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    wrong_count = Column(Integer, default=1)
    last_wrong_at = Column(DateTime, default=datetime.utcnow)
    mastered = Column(Integer, default=0)


class ReviewSchedule(Base):
    __tablename__ = "review_schedule"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    vocab_word_id = Column(Integer, ForeignKey("vocab_words.id"), nullable=True)
    review_stage = Column(Integer, default=0)
    next_review_at = Column(DateTime, nullable=False)
    correct_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, default=None)
    is_active = Column(Integer, default=1)


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    display_name = Column(String(50), nullable=False)
    description = Column(Text, default=None)
    icon = Column(String(100), default=None)
    condition = Column(Text, nullable=False)  # JSON


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.utcnow)
