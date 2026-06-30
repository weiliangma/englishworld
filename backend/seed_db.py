"""初始化题库数据"""
import json
import sys
import os

# 确保能找到 app 包
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, Base, SessionLocal
from app.models.question import Skill, Question
from app.models.pet import Pet, PetStats, PetHomeItem
from app.models.user import UserStats
from app.models.question import ReviewSchedule, Achievement, UserAchievement


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 检查是否已有数据
    if db.query(Skill).count() > 0:
        print("数据库已有数据，跳过初始化")
        db.close()
        return

    # 1. 创建用户初始状态
    stats = UserStats(id=1, level=1, experience=0, coins=50)
    db.add(stats)
    print("✅ 用户统计初始化")

    # 2. 创建宠物初始状态
    pet = Pet(id=1, species="dragon", pet_name="小勇", evolution_stage=1, level=1)
    pstats = PetStats(id=1, hunger=80, happiness=80, energy=80, cleanliness=80)
    db.add(pet)
    db.add(pstats)
    print("✅ 宠物初始化")

    # 3. 宠物商店物品
    shop_items = [
        PetHomeItem(item_type="furniture", item_name="小木凳", item_cost=50, sort_order=1),
        PetHomeItem(item_type="furniture", item_name="小桌子", item_cost=80, sort_order=2),
        PetHomeItem(item_type="decoration", item_name="星星挂件", item_cost=60, sort_order=3),
        PetHomeItem(item_type="skin", item_name="火焰皮肤", item_cost=100, sort_order=4),
        PetHomeItem(item_type="skin", item_name="冰雪皮肤", item_cost=100, sort_order=5),
        PetHomeItem(item_type="decoration", item_name="小披风", item_cost=150, sort_order=6),
    ]
    for item in shop_items:
        db.add(item)
    print("✅ 宠物商店初始化")

    # 4. 技能点 + 题目
    with open(os.path.join(os.path.dirname(__file__), "app", "seed", "skills_data.json"), "r") as f:
        skills_data = json.load(f)

    for sd in skills_data:
        skill = Skill(
            name=sd["name"],
            display_name=sd["display_name"],
            category=sd["category"],
            difficulty=sd["difficulty"],
            boss_name=sd.get("boss_name"),
            boss_hp=sd.get("boss_hp", 10),
            sort_order=sd.get("sort_order", 0),
        )
        db.add(skill)
        db.flush()  # 获取 skill.id

        for qd in sd.get("questions", []):
            q = Question(
                skill_id=skill.id,
                question_type=qd["question_type"],
                difficulty=qd.get("difficulty", 1),
                content=json.dumps(qd["content"], ensure_ascii=False),
                source="manual",
            )
            db.add(q)

    print(f"✅ {len(skills_data)} 个技能点 + 题目初始化")

    db.commit()
    db.close()
    print("🎉 数据库初始化完成！")


if __name__ == "__main__":
    seed()
