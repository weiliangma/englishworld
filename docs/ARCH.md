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
  ├── Pet (宠物)
  │     ├── PetStats (饱腹/快乐/精力/干净)
  │     ├── PetAppearance (皮肤/装饰)
  │     └── PetHome (家具)
  │
  ├── Vocab (词汇系统)
  │     ├── VocabWord (单词)
  │     ├── VocabCollection (已收集)
  │     ├── VocabTopic (主题分组)
  │     ├── PhraseCollocation (固定搭配)
  │     └── ConfusableWord (易混词)
  │
  ├── Cloze (完形填空)
  │     ├── ClozePassage (文章)
  │     └── ClozeBlank (空格)
  │
  └── Reading (阅读理解)
        ├── TowerFloor (高塔楼层)
        └── ReadingQuestion (题目)
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
    category TEXT NOT NULL,                  -- grammar(语法) / vocab(词汇) / reading(阅读) / cloze(完形)
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
    question_type TEXT NOT NULL,             -- choice / word_form / sentence_transform / cloze_word_selection / cloze_multiple_choice / vocab_shoot / vocab_spell / collocation / confusable / reading_choice / reading_true_false / reading_short_answer
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

-- ⭐ 词汇主题（词汇森林的分区）
CREATE TABLE vocab_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                      -- 如 "动物"、"食物"
    icon TEXT DEFAULT '📦',                  -- 主题图标 emoji
    display_name TEXT NOT NULL,              -- 如 "动物乐园"
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,            -- 该主题包含的单词数
    boss_name TEXT DEFAULT '词海巨怪·幼体', -- 该主题 Boss 名
    boss_hp INTEGER DEFAULT 5
);

-- ⭐ 单词库
CREATE TABLE vocab_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER REFERENCES vocab_topics(id),
    word TEXT NOT NULL,                      -- 英文单词
    chinese TEXT NOT NULL,                   -- 中文释义
    phonetic TEXT DEFAULT NULL,              -- 音标（可选）
    part_of_speech TEXT DEFAULT NULL,        -- 词性
    difficulty INTEGER DEFAULT 1,            -- 1-3
    example_sentence TEXT DEFAULT NULL,      -- 例句
    missing_letters TEXT DEFAULT NULL,       -- 拼写题缺字母位置: "a_v_n_u_e"
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⭐ 用户已收集的单词（"单词收集册"）
CREATE TABLE vocab_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER REFERENCES vocab_words(id),
    collected_at TIMESTAMP DEFAULT NOW(),
    mastered INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    UNIQUE(word_id)
);

-- ⭐ 固定搭配库（词组连连看）
CREATE TABLE phrase_collocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    left_part TEXT NOT NULL,                 -- "look"
    right_part TEXT NOT NULL,                -- "after"
    collocation TEXT NOT NULL,               -- "look after"
    chinese TEXT NOT NULL,                   -- "照顾"
    difficulty INTEGER DEFAULT 1
);

-- ⭐ 易混词辨析库
CREATE TABLE confusable_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,              -- 同一组易混词共享一个 group_id
    word TEXT NOT NULL,
    chinese TEXT NOT NULL,
    usage_note TEXT NOT NULL,                -- 一句话辨析
    example_correct TEXT NOT NULL,           -- 正确用法例句
    example_wrong TEXT DEFAULT NULL          -- 常见错误例句
);

-- ⭐ 完形填空文章库（迷宫逃脱）
CREATE TABLE cloze_passages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER REFERENCES skills(id), -- 关联语法点
    passage_type TEXT NOT NULL,              -- word_selection(选词) / multiple_choice(四选一)
    title TEXT NOT NULL,                     -- 文章标题
    passage_text TEXT NOT NULL,              -- 全文（含空格标记 {{0}}{{1}}...）
    word_bank TEXT DEFAULT NULL,             -- 类型A: JSON 词库 ["word1","word2",...]
    word_bank_interference TEXT DEFAULT NULL,-- 类型A: 干扰词 JSON ["干扰1","干扰2",...]
    difficulty INTEGER DEFAULT 1,
    total_blanks INTEGER DEFAULT 6,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⭐ 完形填空空格题目
CREATE TABLE cloze_blanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passage_id INTEGER REFERENCES cloze_passages(id),
    blank_index INTEGER NOT NULL,            -- 第几个空 (0-based)
    options TEXT DEFAULT NULL,               -- 类型B: JSON 选项 ["A","B","C","D"]
    correct_answer TEXT NOT NULL,            -- 选词类型存word, 四选一存"A"/"B"
    explanation TEXT DEFAULT NULL            -- 解析
);

-- ⭐ 📚 阅读高塔（阅读理解）
CREATE TABLE reading_tower_floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_number INTEGER NOT NULL,           -- 第几层
    difficulty INTEGER DEFAULT 1,            -- 1-3 ⭐
    title TEXT NOT NULL,                     -- 文章标题
    category TEXT NOT NULL,                  -- animal/tech/sports/funny/story/other
    passage_text TEXT NOT NULL,              -- 文章正文
    word_count INTEGER DEFAULT 0,
    word_hints TEXT DEFAULT NULL,            -- JSON: {"word": "chinese"} 页面可点击查词
    fun_fact TEXT DEFAULT NULL,              -- 趣味彩蛋（答完显示）
    is_boss INTEGER DEFAULT 0,               -- 是否为Boss层
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⭐ 阅读理解题目
CREATE TABLE reading_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_id INTEGER REFERENCES reading_tower_floors(id),
    question_type TEXT NOT NULL,              -- choice / true_false / short_answer
    question_text TEXT NOT NULL,             -- 题目
    options TEXT NOT NULL,                   -- JSON 选项
    correct_answer TEXT NOT NULL,            -- "A" / "T" / "F" / "B"
    explanation TEXT DEFAULT NULL,           -- 答案解析
    sort_order INTEGER DEFAULT 0
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

### 3.3 词汇

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/vocab/topics | 词汇森林主题列表 | [{id, name, icon, word_count, progress, boss_name}] |
| GET | /api/v1/vocab/topics/:id/words | 主题下的单词列表（含收集状态） | [{word_id, word, chinese, collected, mastered}] |
| POST | /api/v1/vocab/collect | 答题正确→收集单词 | {success, word, reward_coins, pet_learned?} |
| GET | /api/v1/vocab/collection | 已收集单词册 | [{word, chinese, topic, collected_at}] |
| GET | /api/v1/vocab/shoot | 词义射击题目 | {question_id, chinese, options: [4 个英文]} |
| POST | /api/v1/vocab/shoot/answer | 提交射击答案 | {is_correct, correct_word, earned_coins} |
| GET | /api/v1/vocab/spell | 拼写题目 | {question_id, chinese, word_template: "a_v_n_u_e", letters: [可选字母]} |
| POST | /api/v1/vocab/spell/answer | 提交拼写答案 | {is_correct, correct_word, earned_coins} |
| GET | /api/v1/vocab/collocation | 连连看题目 | {question_id, lefts: [...], rights: [...], pairs: N} |
| POST | /api/v1/vocab/collocation/answer | 提交搭配答案 | {is_correct, correct_pairs, earned_coins} |
| GET | /api/v1/vocab/confusable | 易混词题目 | {question_id, sentence, options: [4 个易混词], group_id} |
| POST | /api/v1/vocab/confusable/answer | 提交辨析答案 | {is_correct, explanation, tip_card_unlocked?} |

### 3.4 完形填空（迷宫逃脱）

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/cloze | 获取完形填空关卡列表 | [{id, title, passage_type, difficulty, progress}] |
| GET | /api/v1/cloze/:id | 获取完形填空完整题目 | {passage, blanks, word_bank, type} |
| POST | /api/v1/cloze/:id/submit | 提交所有空答案 | {correct_count, total, earned_coins, escaped?} |
| POST | /api/v1/cloze/:id/blank/:idx | 逐空提交（实时反馈） | {is_correct, explanation, moved_forward?} |

### 3.5 阅读理解（阅读高塔）

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/reading/tower | 获取高塔楼层状态 | [{floor, title, category, stars, completed}] |
| GET | /api/v1/reading/floor/:id | 获取阅读题目 | {passage, word_hints, questions: [...]} |
| POST | /api/v1/reading/floor/:id/submit | 提交所有答案 | {correct_count, total, earned_coins, fun_fact, floor_completed} |
| POST | /api/v1/reading/floor/:id/question/:qid | 逐题提交 | {is_correct, explanation} |
| GET | /api/v1/reading/word-hint/:word | 查词（免费） | {word, chinese} |

### 3.6 成就 & 统计

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
