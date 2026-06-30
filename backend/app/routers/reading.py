from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from ..database import get_db
from ..models.reading import ReadingTowerFloor, ReadingQuestion

router = APIRouter(prefix="/api/v1", tags=["reading"])


# ─── Routes ───────────────────────────────────────────


@router.get("/reading/tower")
def list_reading_floors(db: Session = Depends(get_db)):
    """
    返回阅读塔楼层列表（含完成状态）
    """
    floors = db.query(ReadingTowerFloor).order_by(ReadingTowerFloor.floor_number).all()
    result = []
    for f in floors:
        # 统计该楼层的问题数和已答对数（这里简单返回基本信息）
        question_count = db.query(ReadingQuestion).filter(
            ReadingQuestion.floor_id == f.id
        ).count()
        result.append({
            "id": f.id,
            "floorNumber": f.floor_number,
            "difficulty": f.difficulty,
            "title": f.title,
            "category": f.category,
            "wordCount": f.word_count,
            "wordHints": json.loads(f.word_hints) if f.word_hints else [],
            "funFact": f.fun_fact,
            "isBoss": bool(f.is_boss),
            "questionCount": question_count,
        })
    return result


@router.get("/reading/floor/{floor_id}")
def get_reading_floor(floor_id: int, db: Session = Depends(get_db)):
    """
    返回指定楼层的阅读文章 + 题目列表
    """
    floor = db.query(ReadingTowerFloor).filter(ReadingTowerFloor.id == floor_id).first()
    if not floor:
        raise HTTPException(404, "该楼层不存在")

    questions = db.query(ReadingQuestion).filter(
        ReadingQuestion.floor_id == floor_id
    ).order_by(ReadingQuestion.sort_order).all()

    question_list = []
    for q in questions:
        question_list.append({
            "id": q.id,
            "floorId": q.floor_id,
            "questionType": q.question_type,
            "questionText": q.question_text,
            "options": json.loads(q.options) if q.options else {},
            "correctAnswer": q.correct_answer,
            "explanation": q.explanation,
            "sortOrder": q.sort_order,
        })

    return {
        "id": floor.id,
        "floorNumber": floor.floor_number,
        "difficulty": floor.difficulty,
        "title": floor.title,
        "category": floor.category,
        "passageText": floor.passage_text,
        "wordCount": floor.word_count,
        "wordHints": json.loads(floor.word_hints) if floor.word_hints else [],
        "funFact": floor.fun_fact,
        "isBoss": bool(floor.is_boss),
        "questions": question_list,
    }
