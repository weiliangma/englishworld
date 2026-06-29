# EnglishWorld — 技术架构文档

> 单人版：给自己孩子用的中考英语语法练习平台  
> 技术栈：Python + FastAPI (后端) · React / H5 (前端) · SQLite (本地存储)

---

## 一、整体架构

```
┌──────────────────────┐     ┌──────────────────┐
│  浏览器 / PWA         │────▶│  FastAPI          │
│  (手机/平板)          │◀────│  (后端 API)       │
└──────────────────────┘     └────────┬─────────┘
                                      │
                              ┌───────▼─────────┐
                              │  SQLite          │
                              │  (单用户本地)     │
                              └──────────────────┘
```

**关键设计原则：**
- 单人使用，无注册登录
- 所有数据存本地 SQLite（或 localStorage + 后端 SQLite 双保险）
- 支持 PWA 离线使用
- 游戏逻辑服务端验证，防止本地篡改

---

## 二、数据模型

### 核心实体关系

```
User (1条记录)
  │
  ├── UserStats (等级/经验/金币)
  ├── StudyRecord (答题记录)
  ├── WrongBook (错题本)
  ├── Achievement (已解锁成就)
  │
  └── Pet (宠物)
        ├── PetStats (饱腹/快乐/精力/干净)
        ├── PetAppearance (皮肤/装饰)
        └── PetHome (家具)
```

### 核心表设计

```sql
-- 用户（只有一条记录）
CREATE TABLE user_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,       -- 永远=1
    nickname TEXT DEFAULT '语法勇士',
    pet_name TEXT DEFAULT '小勇',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 知识点（语法点）
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                      -- 如 "一般现在时"
    display_name TEXT NOT NULL,              -- 如 "时态山脉·新手村"
    category TEXT NOT NULL,                  -- tense/preposition/voice/clause/article
    difficulty INTEGER DEFAULT 1,            -- 1-5
    unlock_requirement TEXT,                 -- JSON: {"level": 3, "prev_skill": [1,2]}
    boss_name TEXT,                          -- Boss 名字
    boss_hp INTEGER DEFAULT 10,
    sort_order INTEGER DEFAULT 0
);

-- 题目
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER REFERENCES skills(id),
    question_type TEXT NOT NULL,             -- choice / word_form / sentence_transform / cloze
    difficulty INTEGER DEFAULT 1,            -- 1-3
    content TEXT NOT NULL,                   -- JSON
    source TEXT DEFAULT 'manual',            -- manual / ai_generated / past_exam
    exam_year INTEGER DEFAULT NULL,
    times_answered INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 答题记录
CREATE TABLE study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER REFERENCES questions(id),
    user_answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    time_spent INTEGER,                      -- 毫秒
    combo_at_time INTEGER DEFAULT 0,
    earned_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 用户状态
CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,        -- 永远=1
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 50,                -- 初始送 50 金币喂宠物
    current_streak INTEGER DEFAULT 0,        -- 连续打卡天数
    longest_streak INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_questions INTEGER DEFAULT 0,
    last_active_date TEXT DEFAULT NULL       -- YYYY-MM-DD
);

-- 成就定义
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    condition TEXT NOT NULL                  -- JSON 条件
);

-- 已解锁成就
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_id INTEGER REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT NOW()
);

-- 错题本
CREATE TABLE wrong_book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER REFERENCES questions(id),
    wrong_count INTEGER DEFAULT 1,
    last_wrong_at TIMESTAMP DEFAULT NOW(),
    mastered INTEGER DEFAULT 0
);

-- ⭐ 宠物主表
CREATE TABLE pet (
    id INTEGER PRIMARY KEY DEFAULT 1,        -- 永远=1
    species TEXT DEFAULT 'dragon',           -- dragon / swordsman / mage / ghost
    pet_name TEXT DEFAULT '小勇',
    evolution_stage INTEGER DEFAULT 1,       -- 1=幼年 2=成长 3=成熟 4=完全体
    level INTEGER DEFAULT 1,
    skin_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⭐ 宠物状态
CREATE TABLE pet_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hunger REAL DEFAULT 80,                  -- 0-100 饱腹度
    happiness REAL DEFAULT 80,               -- 0-100 快乐度
    energy REAL DEFAULT 80,                  -- 0-100 精力值
    cleanliness REAL DEFAULT 80,             -- 0-100 干净度
    is_sick INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- ⭐ 宠物装饰/家具
CREATE TABLE pet_home (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,                 -- furniture / decoration / skin
    item_name TEXT NOT NULL,
    item_cost INTEGER NOT NULL,              -- 金币价格
    equipped INTEGER DEFAULT 0,
    purchased INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

-- ⭐ 宠物对话库
CREATE TABLE pet_dialogues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood_condition TEXT NOT NULL,            -- JSON: {"hunger_min": 60, "happiness_min": 60}
    dialogue TEXT NOT NULL,
    probability REAL DEFAULT 1.0             -- 权重
);
```

---

## 三、API 设计（单人版）

所有 API 不需要鉴权，不需要 user_id 参数。

### 3.1 学习

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/skills | 获取语法地图 | [{id, name, display_name, progress, boss_name}] |
| GET | /api/v1/skills/:id/questions | 获取关卡题目（5-10 题一组） | [{question_id, type, content}] |
| POST | /api/v1/answer | 提交答案 | {is_correct, explanation, earned_coins, combo, level_up?, achievement_unlock?} |
| GET | /api/v1/skills/:id/boss | 获取 Boss 战题目 | {boss_name, boss_hp, questions, rewards} |
| POST | /api/v1/answer/batch | 批量提交 Boss 战 | {damage_done, boss_defeated, rewards} |

### 3.2 宠物

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/pet | 获取宠物完整信息 | {species, name, stage, level, stats, skin, home} |
| POST | /api/v1/pet/feed | 喂食（消耗金币） | {success, new_stats, coins_left} |
| POST | /api/v1/pet/play | 陪玩（消耗金币） | {success, new_stats, coins_left} |
| POST | /api/v1/pet/clean | 洗澡（消耗金币） | {success, new_stats, coins_left} |
| POST | /api/v1/pet/sleep | 睡觉（免费，有动画等待） | {success, energy_restored} |
| GET | /api/v1/pet/shop | 商店物品列表 | [{items}] |
| POST | /api/v1/pet/shop/buy | 购买物品 | {success, item, coins_left} |
| POST | /api/v1/pet/shop/equip | 装备/使用物品 | {success, equipped} |

### 3.3 成就 & 统计

| 方法 | 路径 | 描述 |
|---|---|---|
| GET | /api/v1/stats | 获取统计数据（总题数、正确率、连击等） |
| GET | /api/v1/achievements | 已解锁成就列表 |
| GET | /api/v1/wrong-book | 错题本 |
| POST | /api/v1/wrong-book/:id/review | 标记已掌握 |

---

## 四、宠物状态衰减算法

宠物状态每天自然衰减，用时间差计算，不依赖定时任务。

```python
def calculate_stats_decay(last_update, current_time):
    """根据距离上次登录的时间计算衰减"""
    hours_passed = (current_time - last_update).total_seconds() / 3600
    
    # 每 6 小时衰减 5%
    decay_rate = 5.0  # %
    decay_interval = 6  # hours
    
    decay_cycles = hours_passed / decay_interval
    decay_cycles = min(decay_cycles, 4)  # 最多衰减 4 个周期（24 小时）
    
    return {
        'hunger': decay_cycles * decay_rate,
        'happiness': decay_cycles * decay_rate,
        'energy': decay_cycles * (decay_rate * 0.5),  # 精力衰减慢一半
        'cleanliness': decay_cycles * (decay_rate * 0.8)
    }
```

---

## 五、部署方案

### 开发阶段
```
前端：Vite + React + PWA → 本地预览
后端：FastAPI + SQLite → localhost
```

### 给孩子用（部署）
```
方案一：内网服务器 + 手机浏览器访问
方案二：直接手机本地运行（Python + 内嵌 Webview / PWA）
方案三：轻量云服务器（腾讯云轻量 ¥30/月）+ 域名
```

**不需要：** CDN、K8s、负载均衡、分布式数据库、用户系统

---

## 六、隐私 & 安全

- 无注册、无登录、无手机号、无邮箱
- 所有学习数据只存本地 SQLite
- 不上传任何数据到第三方
- 不需要家长同意（不收集任何个人信息）
- 纯本地运行或自建服务器

---

## 七、宠物对话库示例（JSON）

```json
[
  {"mood": "happy", "dialogues": [
    "主人好厉害！",
    "今天也想做题吗？",
    "我最喜欢主人了！",
    "看，我又长大了！",
    "金币金币~好多金币~"
  ]},
  {"mood": "hungry", "dialogues": [
    "主人...我饿了...",
    "肚子咕咕叫...",
    "想吃小饼干..."
  ]},
  {"mood": "sick", "dialogues": [
    "咳咳...主人你终于来了...",
    "好难受...需要休息...",
    "呜呜..."
  ]},
  {"mood": "idle", "dialogues": [
    "主人去哪了...",
    "好无聊啊...",
    "想和主人一起玩..."
  ]},
  {"mood": "boss_win", "dialogues": [
    "太帅了！主人赢了！",
    "耶耶耶！我们最棒！",
    "那个 Boss 被打跑了！"
  ]}
]
```
