from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import json

from ..database import get_db
from ..models.question import ReviewSchedule, Question, StudyRecord
from ..models.user import UserStats

router = APIRouter(prefix="/api/v1/review", tags=["review"])

REVIEW_INTERVALS = [1, 3, 7, 14, 30]
REVIEW_MAX_STAGE = 5
REVIEW_COIN_MULTIPLIER = 1.5


def get_or_create_stats(db: Session) -> UserStats:
    stats = db.query(UserStats).filter(UserStats.id == 1).first()
    if not stats:
        stats = UserStats(id=1)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


@router.get("/due")
def due_reviews(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    due = db.query(ReviewSchedule).filter(
        ReviewSchedule.is_active == 1,
        ReviewSchedule.next_review_at <= now,
    ).order_by(ReviewSchedule.next_review_at.asc()).limit(10).all()

    result = []
    for r in due:
        q = db.query(Question).filter(Question.id == r.question_id).first()
        if q:
            content = json.loads(q.content) if isinstance(q.content, str) else q.content
            result.append({
                "question_id": q.id,
                "type": q.question_type,
                "content": content,
                "stage": r.review_stage,
                "days_overdue": (now - r.next_review_at).days if r.next_review_at else 0,
            })
    return result


@router.get("/next")
def next_review(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    due = db.query(ReviewSchedule).filter(
        ReviewSchedule.is_active == 1,
        ReviewSchedule.next_review_at <= now,
    ).order_by(ReviewSchedule.next_review_at.asc()).first()

    if not due:
        return {"question_id": None, "message": "没有到期复习题"}

    q = db.query(Question).filter(Question.id == due.question_id).first()
    if not q:
        return {"question_id": None, "message": "题目不存在"}

    content = json.loads(q.content) if isinstance(q.content, str) else q.content
    return {
        "question_id": q.id,
        "type": q.question_type,
        "content": content,
        "stage": due.review_stage,
        "progress": f"{due.review_stage + 1}/5",
    }


class ReviewAnswer(BaseModel):
    question_id: int
    user_answer: str


@router.post("/answer")
def submit_review_answer(data: ReviewAnswer, db: Session = Depends(get_db)):
    review = db.query(ReviewSchedule).filter(
        ReviewSchedule.question_id == data.question_id
    ).first()
    if not review:
        return {"is_correct": False, "message": "不在复习队列中"}

    q = db.query(Question).filter(Question.id == data.question_id).first()
    content = json.loads(q.content) if isinstance(q.content, str) else q.content
    correct_answer = content.get("answer", "")
    is_correct = data.user_answer.strip().upper() == correct_answer.strip().upper()

    now = datetime.utcnow()
    stats = get_or_create_stats(db)

    if is_correct:
        review.correct_count += 1
        review.review_stage += 1

        if review.review_stage >= REVIEW_MAX_STAGE:
            # 已掌握
            review.is_active = 0
            review.next_review_at = None
            coins_earned = int(10 * REVIEW_COIN_MULTIPLIER)
            stats.coins += coins_earned
            db.commit()
            return {
                "is_correct": True,
                "mastered": True,
                "earned_coins": coins_earned,
                "message": "已掌握！",
            }
        else:
            interval = REVIEW_INTERVALS[review.review_stage]
            review.next_review_at = now + __import__("datetime").timedelta(days=interval)
            coins_earned = int(10 * REVIEW_COIN_MULTIPLIER)
            stats.coins += coins_earned
    else:
        # 答错 → 重置
        review.review_stage = 0
        review.next_review_at = now + __import__("datetime").timedelta(days=1)
        coins_earned = 0

    review.last_reviewed_at = now
    db.commit()

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "stage": review.review_stage,
        "next_review_in_days": REVIEW_INTERVALS[review.review_stage] if is_correct else 1,
        "mastered": False,
        "earned_coins": coins_earned,
    }


@router.get("/stats")
def review_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    due_count = db.query(ReviewSchedule).filter(
        ReviewSchedule.is_active == 1,
        ReviewSchedule.next_review_at <= now,
    ).count()
    total = db.query(ReviewSchedule).filter(
        ReviewSchedule.is_active == 1
    ).count()
    mastered = db.query(ReviewSchedule).filter(
        ReviewSchedule.is_active == 0,
        ReviewSchedule.review_stage >= REVIEW_MAX_STAGE,
    ).count()

    return {
        "due_count": due_count,
        "total_in_queue": total,
        "mastered_count": mastered,
        "streak_days": 0,  # TODO: 实现连续复习天数
    }
