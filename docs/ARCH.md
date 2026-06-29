# EnglishWorld — 技术架构文档

> 面向 12 岁上海男生的中考英语语法练习平台  
> 技术栈：Python + FastAPI (后端) · React / 移动端 H5 (前端) · SQLite / PostgreSQL

---

## 一、整体架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  浏览器/PWA  │────▶│  FastAPI     │────▶│  SQLite/DB   │
│  (手机/平板) │◀────│  (后端 API)  │◀────│              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────▼───────┐
                    │  AI 出题引擎   │
                    │  (可选阶段四)  │
                    └───────────────┘
```

**关键设计原则：**
- 后端无状态，可水平扩展
- 前端 PWA，离线可用（练过的题不联网也能重刷）
- 所有游戏逻辑在服务端验证（防止作弊刷分）
- 动画/音效本地缓存，不依赖网络加载

---

## 二、数据模型

### 核心实体关系

```
User ──1:N──▶ StudyRecord
  │              │
  │              ▼
  │           Question
  │              │
  │          ┌───┴───┐
  │          ▼       ▼
  │       Answer   WrongBook
  │
  ├──1:1──▶ UserStats (等级/经验/金币)
  ├──1:1──▶ UserStreak (连续打卡)
  └──M:N──▶ Achievement (成就)
```

### 核心表设计

```sql
-- 用户
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,                -- 中二昵称
    avatar_id INTEGER DEFAULT 1,           -- 角色皮肤
    class_id INTEGER DEFAULT NULL,         -- 班级
    created_at TIMESTAMP DEFAULT NOW()
);

-- 知识点（语法点）
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- 如 "一般现在时"
    display_name TEXT NOT NULL,            -- 如 "时态山脉·新手村"
    category TEXT NOT NULL,                -- tense/preposition/voice/clause/article
    difficulty INTEGER DEFAULT 1,          -- 1-5
    unlock_condition TEXT,                 -- JSON: {"level": 3, "prev_skill": [1,2]}
    boss_name TEXT,                        -- Boss 名字
    boss_hp INTEGER DEFAULT 10,
    sort_order INTEGER DEFAULT 0
);

-- 题目
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER REFERENCES skills(id),
    question_type TEXT NOT NULL,            -- choice / word_form / sentence_transform / cloze
    difficulty INTEGER DEFAULT 1,           -- 1-3
    content TEXT NOT NULL,                  -- 题目内容（JSON，包含题干、选项、答案、解析）
    -- choice: {stem, options: [A,B,C,D], answer: "A", explanation}
    -- word_form: {stem, base_word, correct_form, options: [suffixes], explanation}
    -- sentence_transform: {original, instruction, answer, steps: [...], explanation}
    -- cloze: {passage, blanks: [{position, options, answer}]}
    source TEXT DEFAULT 'manual',           -- manual / ai_generated / past_exam
    exam_year INTEGER DEFAULT NULL,         -- 中考真题年份
    times_used INTEGER DEFAULT 0,           -- 被作答次数
    correct_rate REAL DEFAULT 0.0,          -- 正确率
    created_at TIMESTAMP DEFAULT NOW()
);

-- 答题记录
CREATE TABLE study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES questions(id),
    user_answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    time_spent INTEGER,                     -- 毫秒
    combo_at_time INTEGER DEFAULT 0,        -- 当时的连击数
    earned_coins INTEGER DEFAULT 0,         -- 该题获得金币
    created_at TIMESTAMP DEFAULT NOW()
);

-- 用户状态
CREATE TABLE user_stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,       -- 连续打卡天数
    longest_streak INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_questions INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0
);

-- 成就
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,                              -- 勋章图标路径
    condition TEXT NOT NULL                 -- JSON 条件
);

CREATE TABLE user_achievements (
    user_id INTEGER REFERENCES users(id),
    achievement_id INTEGER REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- 错题本（战利品宝库）
CREATE TABLE wrong_book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES questions(id),
    wrong_count INTEGER DEFAULT 1,
    last_wrong_at TIMESTAMP DEFAULT NOW(),
    mastered INTEGER DEFAULT 0,
    reviewed_at TIMESTAMP DEFAULT NULL,
    UNIQUE(user_id, question_id)
);
```

---

## 三、API 设计

### 3.1 用户

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| POST | /api/v1/user/register | 注册（无密码，仅昵称） | {user_id, token} |
| GET | /api/v1/user/profile | 获取用户资料 | {nickname, level, exp, coins, ...} |
| PATCH | /api/v1/user/profile | 更新资料（皮肤/称号） | — |

### 3.2 学习

| 方法 | 路径 | 描述 | 返回值 |
|---|---|---|---|
| GET | /api/v1/skills | 获取语法地图 | [{id, name, boss_name, progress, ...}] |
| GET | /api/v1/skills/:id/questions | 获取关卡题目（5-10 题一组） | [{question_id, type, content}] |
| POST | /api/v1/answer | 提交答案 | {is_correct, explanation, earned_coins, combo, level_up?, achievement_unlock?} |
| GET | /api/v1/skills/:id/boss | 获取 Boss 战题目 | {boss_name, boss_hp, questions: [...], rewards} |
| POST | /api/v1/answer/batch | 批量提交 Boss 战 | {damage_done, boss_defeated, rewards} |

### 3.3 排行榜

| 方法 | 路径 | 描述 |
|---|---|---|
| GET | /api/v1/leaderboard/global | 全服排行（匿名昵称） |
| GET | /api/v1/leaderboard/class | 班级排行（需关联班级） |
| GET | /api/v1/leaderboard/weekly | 本周进步榜 |

### 3.4 错题本

| 方法 | 路径 | 描述 |
|---|---|---|
| GET | /api/v1/wrong-book | 获取错题列表 |
| POST | /api/v1/wrong-book/:id/review | 标记"已掌握" |
| GET | /api/v1/wrong-book/revive | 获取"复活怪物"（精选错题） |

---

## 四、技术约束 & 性能需求

### 4.1 性能指标（针对 12 岁用户）
- 页面加载：首次 < 2 秒（PWA 缓存后 < 0.5 秒）
- 答题反馈：< 300ms（动画延迟超过 300ms 会让他觉得"卡了"）
- 每题切换：< 500ms
- 排行榜刷新：手动下拉刷新即可，不要自动 polling

### 4.2 前端缓存策略
- 题目资源（JSON）→ Service Worker 缓存，离线可用
- 角色动画（Lottie/Spritesheet）→ 预加载，本地存储
- 音效（正确/错误/金币/Boss 怒吼）→ Web Audio API + 预缓存
- 用户进度 → IndexedDB 本地备份 + 联网同步

### 4.3 游戏化数据一致性
- 金币和等级必须在服务端计算和验证
- 前端仅用于展示和动画
- 作弊检测：异常高频请求（> 5 题/秒）触发风控

---

## 五、AI 出题引擎（阶段四）

```
用户画像 (向量)
    │
    ▼
错题分析 ──▶ 薄弱知识点识别 ──▶ 难度调整
    │                            │
    ▼                            ▼
知识点模板 ──▶ LLM Prompt ──▶ 生成题目 ──▶ 人工审核规则校验 ──▶ 入库
```

**Prompt 模板（以时态为例）：**

```
你是一个中考英语出题老师。请为上海初一男生生成一道关于"一般过去时"的
单项选择题。

要求：
- 题干包含清晰的过去时间标志词（yesterday, last, ago...）
- 干扰项覆盖：一般现在时、现在完成时、过去进行时
- 选项使用 A/B/C/D
- 附带中文解析（12岁男生能看懂，不要术语堆砌）
- 配一个 "中二" 风格的场景（如 "勇者昨天打败了史莱姆"）
```

---

## 六、部署方案

### MVP（阶段一）
```
前端：Vite + React + PWA → 部署到 Vercel / Netlify
后端：FastAPI + SQLite → 部署到 Railway / Fly.io
域名：englishworld.fun（或者类似的中二域名）
```

### 规模化（阶段二+）
```
静态资源：CDN（Cloudflare）
API 服务：Docker + K8s / 阿里云 ECS
数据库：PostgreSQL + Read Replica
文件存储：阿里云 OSS（角色立绘、音效）
```

---

## 七、安全 & 隐私

- 用户数据最小化：不需要真实姓名、手机号、邮箱
- 仅存储：昵称 + 年级（可选）+ 班级码（可选）
- 不使用第三方 SDK（不接入广告 SDK）
- 所有数据存储在中国大陆（阿里云）
- 符合《未成年人保护法》及《个人信息保护法》要求
- 无需家长同意即可使用（因为没有收集敏感个人信息）

---

## 八、性能预算

> "小明打开页面等了 3 秒还没加载出来 → 切到抖音去了"

| 资源类型 | 预算上限 | 备注 |
|---|---|---|
| 首屏 JS | < 200KB | 代码分割，按需加载 |
| 首屏 CSS | < 50KB | 关键 CSS 内联 |
| 初始图片 | < 100KB | 使用 SVG 或像素风格小图 |
| 字体 | < 50KB | 仅加载英文字体，中文用系统字体 |
| 总初始加载 | < 500KB | 超过就是超重 |
| 每次答题 API | < 50KB 返回 | 包含题目内容和选项即可 |
| Service Worker | < 100KB | 独立于主包 |
