from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import json

from ..database import get_db
from ..models.question import Skill, Question, StudyRecord, WrongBook, ReviewSchedule
from ..models.user import UserStats

router = APIRouter(prefix="/api/v1", tags=["learning"])


# ─── Schemas ──────────────────────────────────────────

class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: str
    time_spent: int  # milliseconds


# ─── Helpers ──────────────────────────────────────────

def calc_coin_reward(is_correct: bool, combo: int) -> int:
    """计算答题金币奖励"""
    if not is_correct:
        return 0
    base = 10
    if combo >= 10:
        return base * 2  # 双倍
    if combo >= 5:
        return base + 5  # 1.5倍
    return base


def calc_exp(is_correct: bool) -> int:
    return 20 if is_correct else 5


def get_or_create_stats(db: Session) -> UserStats:
    stats = db.query(UserStats).filter(UserStats.id == 1).first()
    if not stats:
        stats = UserStats(id=1)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


# ─── Routes ───────────────────────────────────────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    stats = get_or_create_stats(db)
    return {
        "level": stats.level,
        "experience": stats.experience,
        "coins": stats.coins,
        "streak": stats.current_streak,
        "totalQuestions": stats.total_questions,
        "correctQuestions": stats.correct_questions,
    }


@router.get("/skills")
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.sort_order).all()
    result = []
    for s in skills:
        result.append({
            "id": s.id,
            "name": s.name,
            "display_name": s.display_name,
            "category": s.category,
            "difficulty": s.difficulty,
            "boss_name": s.boss_name,
        })
    return result


@router.get("/skills/{skill_id}/questions")
def get_skill_questions(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "技能点不存在")

    questions = db.query(Question).filter(
        Question.skill_id == skill_id
    ).limit(10).all()

    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "skill_id": q.skill_id,
            "question_type": q.question_type,
            "content": json.loads(q.content),
            "difficulty": q.difficulty,
        })
    return result


@router.post("/answer")
def submit_answer(data: AnswerSubmit, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == data.question_id).first()
    if not question:
        raise HTTPException(404, "题目不存在")

    content = json.loads(question.content)
    correct_answer = content.get("answer", "")
    is_correct = data.user_answer.strip().upper() == correct_answer.strip().upper()

    # 更新题目统计
    question.times_answered += 1
    if is_correct:
        question.correct_count += 1

    # 计算 combo（简单处理：查最近5条记录）
    recent = db.query(StudyRecord).order_by(StudyRecord.id.desc()).limit(5).all()
    combo = sum(1 for r in recent if r.is_correct)
    if not is_correct:
        combo = 0

    # 记录答题
    record = StudyRecord(
        question_id=data.question_id,
        user_answer=data.user_answer,
        is_correct=1 if is_correct else 0,
        time_spent=data.time_spent,
        combo_at_time=combo,
        earned_coins=calc_coin_reward(is_correct, combo),
    )
    db.add(record)

    # 更新用户统计
    stats = get_or_create_stats(db)
    stats.total_questions += 1
    if is_correct:
        stats.correct_questions += 1
        stats.experience += calc_exp(True)
        stats.coins += calc_coin_reward(is_correct, combo)

    # 检查升级
    new_level = stats.experience // 100 + 1
    level_up = new_level > stats.level
    stats.level = new_level

    # 答错 → 加入错题本 + 复习队列
    if not is_correct:
        wrong = db.query(WrongBook).filter(
            WrongBook.question_id == data.question_id
        ).first()
        if wrong:
            wrong.wrong_count += 1
            wrong.last_wrong_at = datetime.utcnow()
        else:
            db.add(WrongBook(question_id=data.question_id))

        # 复习调度
        review = db.query(ReviewSchedule).filter(
            ReviewSchedule.question_id == data.question_id
        ).first()
        if review:
            review.review_stage = 0
            review.next_review_at = datetime.utcnow() + timedelta(days=1)
            review.is_active = 1
        else:
            db.add(ReviewSchedule(
                question_id=data.question_id,
                review_stage=0,
                next_review_at=datetime.utcnow() + timedelta(days=1),
            ))

    db.commit()

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "earned_coins": calc_coin_reward(is_correct, combo),
        "earned_exp": calc_exp(is_correct),
        "combo": combo,
        "level_up": level_up,
        "new_level": stats.level if level_up else None,
        "explanation": content.get("explanation", None),
    }
