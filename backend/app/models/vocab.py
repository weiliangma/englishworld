from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from ..database import Base


class VocabTopic(Base):
    __tablename__ = "vocab_topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(10), default="📦")
    display_name = Column(String(50), nullable=False)
    description = Column(Text, default=None)
    sort_order = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    boss_name = Column(String(50), default="词海巨怪·幼体")
    boss_hp = Column(Integer, default=5)


class VocabWord(Base):
    __tablename__ = "vocab_words"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("vocab_topics.id"))
    word = Column(String(100), nullable=False)
    chinese = Column(String(200), nullable=False)
    phonetic = Column(String(100), default=None)
    part_of_speech = Column(String(20), default=None)
    difficulty = Column(Integer, default=1)
    example_sentence = Column(Text, default=None)
    missing_letters = Column(String(50), default=None)
    created_at = Column(DateTime, default=datetime.utcnow)


class VocabCollection(Base):
    __tablename__ = "vocab_collection"
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("vocab_words.id"), unique=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    mastered = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)


class PhraseCollocation(Base):
    __tablename__ = "phrase_collocations"
    id = Column(Integer, primary_key=True, index=True)
    left_part = Column(String(50), nullable=False)
    right_part = Column(String(50), nullable=False)
    collocation = Column(String(100), nullable=False)
    chinese = Column(String(200), nullable=False)
    difficulty = Column(Integer, default=1)


class ConfusableWord(Base):
    __tablename__ = "confusable_words"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, nullable=False)
    word = Column(String(100), nullable=False)
    chinese = Column(String(200), nullable=False)
    usage_note = Column(Text, nullable=False)
    example_correct = Column(Text, nullable=False)
    example_wrong = Column(Text, default=None)
