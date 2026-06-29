# EnglishWorld — 代码任务计划

> 从文档到代码的可执行路线图，按阶段组织，每个阶段有明确交付物和验收标准。

---

## 一、技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 后端框架 | FastAPI (Python 3.11+) | 异步 API 服务 |
| 数据库 | SQLite → PostgreSQL | 开发用 SQLite，部署可升 Pg |
| ORM | SQLAlchemy + Alembic | 数据迁移管理 |
| 前端框架 | React 18 + TypeScript | Vite 构建 |
| 样式 | Tailwind CSS | 快速出界面 |
| 状态管理 | Zustand | 轻量级 |
| 动画 | Framer Motion | 宠物/反馈动画 |
| 音频 | Web Speech API + `<audio>` | 发音+听力 |
| PWA | vite-plugin-pwa | 离线可用 |
| 音频生成 | edge-tts (Python) | 听力 MP3 批量生成 |

---

## 二、项目目录结构

```
englishworld/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # 配置
│   │   ├── database.py          # SQLAlchemy 连接
│   │   ├── models/              # SQLAlchemy 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── question.py
│   │   │   ├── skill.py
│   │   │   ├── vocab.py
│   │   │   ├── reading.py
│   │   │   ├── listening.py
│   │   │   ├── pet.py
│   │   │   └── review.py
│   │   ├── routers/             # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── learning.py
│   │   │   ├── pet.py
│   │   │   ├── vocab.py
│   │   │   ├── reading.py
│   │   │   ├── listening.py
│   │   │   ├── review.py
│   │   │   ├── stats.py
│   │   │   └── pronounce.py
│   │   ├── services/            # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── review_scheduler.py  # 复习调度算法
│   │   │   ├── pet_stats.py         # 宠物状态衰减
│   │   │   ├── audio_generator.py   # edge-tts 音频生成
│   │   │   └── achievement_checker.py
│   │   └── seed/                # 初始题库数据
│   │       ├── grammar_questions.json
│   │       ├── vocab_words.json
│   │       ├── reading_passages.json
│   │       ├── listening_passages.json
│   │       └── collocations.json
│   ├── audio/                   # 生成的 MP3 文件
│   ├── alembic/                 # 数据库迁移
│   ├── requirements.txt
│   └── seed_db.py               # 初始化数据库脚本
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routes.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── MapPage.tsx
│   │   │   ├── SkillDetail.tsx
│   │   │   ├── QuestionPage.tsx
│   │   │   ├── BossBattle.tsx
│   │   │   ├── PetHome.tsx
│   │   │   ├── WordCollection.tsx
│   │   │   ├── ReadingTower.tsx
│   │   │   ├── ReadingFloor.tsx
│   │   │   ├── ListeningChannels.tsx
│   │   │   ├── ListeningPlayer.tsx
│   │   │   ├── LightningReview.tsx
│   │   │   ├── Achievements.tsx
│   │   │   └── WrongBook.tsx
│   │   ├── components/          # 可复用组件
│   │   │   ├── AudioPlayer.tsx  # 收音机播放器
│   │   │   ├── PetWidget.tsx    # 宠物展示
│   │   │   ├── CoinAnimation.tsx
│   │   │   ├── ExpBar.tsx
│   │   │   ├── ComboIndicator.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   ├── OptionButton.tsx
│   │   │   ├── DragDropZone.tsx # 拖拽组件
│   │   │   └── MapTab.tsx
│   │   ├── hooks/               # 自定义 hooks
│   │   │   ├── usePetStatus.ts
│   │   │   ├── useReviewQueue.ts
│   │   │   ├── useAudio.ts
│   │   │   └── useCombo.ts
│   │   ├── stores/              # Zustand 状态
│   │   │   ├── userStore.ts
│   │   │   ├── petStore.ts
│   │   │   └── gameStore.ts
│   │   ├── services/            # API 调用
│   │   │   └── api.ts
│   │   └── utils/
│   │       └── speech.ts        # Web Speech API 封装
│   ├── public/
│   │   └── audio/               # 预置音频
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                        # 已有文档
└── README.md
```

---

## 三、分阶段实施计划

### 阶段 0：项目初始化（预估：1 天）

**目标：** 跑通前后端连接，数据库能读写

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 0.1 | 初始化后端项目 | `backend/app/main.py`, `requirements.txt` | FastAPI 启动，`/health` 返回 OK |
| 0.2 | 数据库连接 + 配置 | `backend/app/database.py`, `config.py` | SQLite 连接成功 |
| 0.3 | SQLAlchemy 模型定义 | `backend/app/models/*.py` | 所有表模型就绪 |
| 0.4 | Alembic 初始化 + 首次迁移 | `backend/alembic/` | `alembic upgrade head` 建表成功 |
| 0.5 | 初始化前端项目 | `frontend/` (Vite+React+TS) | `npm run dev` 显示首页 |
| 0.6 | API 调用测试 | `frontend/src/services/api.ts` | 前端能调 `/health` 并显示结果 |

**验收标准：** `curl localhost:8000/health` 返回 `{"status": "ok"}` + 浏览器打开 `localhost:5173` 显示页面

---

### 阶段 1：核心答题流程（预估：3 天）

**目标：** 用户能看到语法点地图，点进去答题，提交答案有反馈

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 1.1 | 用户/统计 API（单用户） | `routers/__init__`, `models/user.py` | `GET /api/v1/stats` 返回等级/金币 |
| 1.2 | 语法技能 API | `routers/learning.py`, `models/skill.py` | `GET /api/v1/skills` 返回语法点列表 |
| 1.3 | 题目 API | `routers/learning.py`, `models/question.py` | `GET /api/v1/skills/:id/questions` 出题 |
| 1.4 | 提交答案 API | `routers/learning.py` | `POST /api/v1/answer` 返回对错+金币 |
| 1.5 | **前端：首页** | `pages/HomePage.tsx` | 显示经验条、金币、继续挑战按钮 |
| 1.6 | **前端：语法地图** | `pages/MapPage.tsx` | 显示语法大陆列表，点击进关卡 |
| 1.7 | **前端：答题页** | `pages/QuestionPage.tsx` | 选择题模式，倒计时，对错反馈 |
| 1.8 | **前端：结算页** | `components/` | 正确率、获得金币、升级提示 |

**验收标准：** 用户从首页 → 点语法地图 → 选时态山脉 → 做 5 道选择题 → 看到正确率和金币增加

---

### 阶段 2：语法题型全覆盖（预估：2 天）

**目标：** 4 种语法题型全部可玩

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 2.1 | 词形转换题型 | `QuestionPage.tsx` (拼装模式) | 显示词根+后缀碎片，拖拽拼合 |
| 2.2 | 句型转换题型 | `QuestionPage.tsx` (手术模式) | 点击修改句子，改造反馈 |
| 2.3 | 完形填空（选词） | `pages/ClozePage.tsx` | 短文+词库，拖拽填空 |
| 2.4 | 完形填空（四选一） | `pages/ClozePage.tsx` | 短文+逐空选择 |
| 2.5 | Boss 战模式 | `pages/BossBattle.tsx` | 10 题混合，Boss 血条，宠物加油 |
| 2.6 | 后端：错题本记录 | `routers/learning.py` | 答错自动写入 `wrong_book` + `review_schedule` |

**验收标准：** 每种题型能完成一局，有正确的金币和经验奖励

---

### 阶段 3：词汇系统（预估：3 天）

**目标：** 词汇森林 5 种玩法全部可用

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 3.1 | 词汇主题 + 单词库 API | `routers/vocab.py`, `models/vocab.py` | 主题列表、单词列表 |
| 3.2 | 词义射击 | `pages/VocabShoot.tsx` | 中文显示，4 英文选项，6 秒倒计时 |
| 3.3 | 单词拼写 | `pages/VocabSpell.tsx` | 缺字母模板 + 字母按钮选择 |
| 3.4 | 词组连连看 | `pages/Collocation.tsx` | 左右拖拽连线，链条特效 |
| 3.5 | 易混词辨析 | `pages/Confusable.tsx` | 句子+4 选项，答对弹辨析卡片 |
| 3.6 | 单词收集册 | `pages/WordCollection.tsx` | 翻卡模式，收集进度，主题装饰 |
| 3.7 | 前端：词汇森林 Tab | `MapPage.tsx` | 词汇森林视图，主题列表 |

**验收标准：** 从地图进词汇森林 → 选动物主题 → 可以射击/拼写/连连看 → 单词收集册有进度

---

### 阶段 4：宠物系统（预估：3 天）

**目标：** 宠物可以喂食、陪玩、洗澡、进化、逛商店

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 4.1 | 宠物 API | `routers/pet.py`, `models/pet.py` | CRUD + 状态衰减 |
| 4.2 | 宠物状态衰减服务 | `services/pet_stats.py` | 按时间差自动衰减 |
| 4.3 | 宠物互动（喂/玩/洗/睡） | `pages/PetHome.tsx` | 4 个按钮，消耗金币，状态变化 |
| 4.4 | 宠物商店 | `pages/PetHome.tsx` (商店弹窗) | 列表展示，金币购买，装备 |
| 4.5 | 宠物进化 | `services/pet_stats.py` | 等级到达自动进化 |
| 4.6 | 宠物对话系统 | `services/pet_stats.py` | 根据心情/触发条件说不同的话 |
| 4.7 | 前端：宠物 Widget | `components/PetWidget.tsx` | 首页和全局显示的宠物形象 |
| 4.8 | 答题联动（宠物反应） | `services/achievement_checker.py` | 连击时宠物撒花/Boss战时加油 |

**验收标准：** 宠物饿了会提示 → 喂食消耗金币 → 饱腹度上升 → 升级后进化形态

---

### 阶段 5：阅读高塔（预估：2 天）

**目标：** 阅读理解 3 种题型 + 爬塔机制

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 5.1 | 阅读文章 + 题目 API | `routers/reading.py`, `models/reading.py` | 楼层列表、文章、题目 |
| 5.2 | 阅读高塔入口 | `pages/ReadingTower.tsx` | 楼层列表，已通过/锁定状态 |
| 5.3 | 阅读答题（选择题） | `pages/ReadingFloor.tsx` | 文章 + 3-5 题选择 |
| 5.4 | 阅读答题（判断正误） | `pages/ReadingFloor.tsx` | T/F 按钮，盖章特效 |
| 5.5 | 阅读答题（简答选择） | `pages/ReadingFloor.tsx` | 问题 + 选项选择 |
| 5.6 | 点词查义功能 | `pages/ReadingFloor.tsx` | 点击文章中生词弹出中文释义 |
| 5.7 | 趣味彩蛋展示 | `pages/ReadingFloor.tsx` | 答完显示 fun_fact |

**验收标准：** 爬 3 层塔，每层做题，答完看到趣味彩蛋，宠物戴侦探帽

---

### 阶段 6：听力系统（预估：2 天）

**目标：** 收音机播放器 + 5 种听力题型

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 6.1 | edge-tts 音频生成服务 | `services/audio_generator.py` | 批量生成 MP3 |
| 6.2 | 听力 API | `routers/listening.py`, `models/listening.py` | 频道、题目、播放次数 |
| 6.3 | 收音机播放器组件 | `components/AudioPlayer.tsx` | 播放/暂停/调速/重听/次数限制 |
| 6.4 | 电波台频道入口 | `pages/ListeningChannels.tsx` | FM 频道列表 |
| 6.5 | 听力答题页 | `pages/ListeningPlayer.tsx` | 播放+题目（听完解锁） |
| 6.6 | 单词发音（Web Speech API） | `utils/speech.ts` | 点击单词发音 |
| 6.7 | 单词发音 API 备选 | `routers/pronounce.py` | 如不用 Web Speech API 的 MP3 方案 |

**验收标准：** 进 FM 88.5 → 播放录音 → 听完后题目解锁 → 答题 → 看到原文

---

### 阶段 7：智能复习系统（预估：2 天）

**目标：** 自动调度复习，闪电复习流程

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 7.1 | 复习调度服务 | `services/review_scheduler.py` | 间隔重复算法 |
| 7.2 | 复习 API | `routers/review.py` | due/next/answer/skip/stats |
| 7.3 | 首页复习提醒 | `pages/HomePage.tsx` | ⚠️ 复习条数显示 |
| 7.4 | 闪电复习流程 | `pages/LightningReview.tsx` | 3-5 题快速复习 |
| 7.5 | 答完题自动触发复习 | `pages/QuestionPage.tsx` | 检查队列，弹出复习 |
| 7.6 | 复习结算页 | `pages/LightningReview.tsx` | 正确率、1.5x 金币、连胜 |

**验收标准：** 答错一题 → 1 天后（可调）首页出现待复习提醒 → 闪电复习 → 答对延后

---

### 阶段 8：成就 + 战利品宝库（预估：1 天）

**目标：** 成就系统 + 错题本可视化

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 8.1 | 成就检测服务 | `services/achievement_checker.py` | 每次答题后检查条件 |
| 8.2 | 成就 API | `routers/stats.py` | 成就列表/解锁 |
| 8.3 | 成就页面 | `pages/Achievements.tsx` | 勋章墙展示 |
| 8.4 | 战利品宝库页面 | `pages/WrongBook.tsx` | 怪物卡片列表 + 再来一战 |
| 8.5 | 每周怪物复活 | `services/review_scheduler.py` | 定时任务 |

**验收标准：** 完成第一关 → 成就页面出现"语法新兵"勋章

---

### 阶段 9：初始题库数据（预估：2 天）

**目标：** 第一批可用题库

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 9.1 | 语法题 100 道 | `seed/grammar_questions.json` | 覆盖所有语法考点 |
| 9.2 | 词汇 160 词（2 个主题） | `seed/vocab_words.json` | 动物 + 食物主题 |
| 9.3 | 固定搭配 20 组 | `seed/collocations.json` | 中考高频搭配 |
| 9.4 | 易混词 5 组 | `seed/vocab_words.json` | spend/cost/take/pay 等 |
| 9.5 | 阅读文章 5 篇 | `seed/reading_passages.json` | 动物/科技/体育/冷知识/故事 |
| 9.6 | 听力短文 5 篇（含生成 MP3） | `seed/listening_passages.json` | 校园/日常各 2-3 篇 |
| 9.7 | 种子数据入库脚本 | `seed_db.py` | 一键初始化数据库 |

**验收标准：** 运行 `python seed_db.py` 后数据库有完整初始数据

---

### 阶段 10：PWA + 打磨（预估：2 天）

**目标：** 离线可用 + 动画打磨

| # | 任务 | 文件 | 交付物 |
|---|---|---|---|
| 10.1 | PWA 配置 | `vite.config.ts` (vite-plugin-pwa) | 可添加到桌面，离线缓存 |
| 10.2 | Service Worker 缓存策略 | 自动生成 | 题目/音频/图片离线可用 |
| 10.3 | 金币飞入动画 | `components/CoinAnimation.tsx` | 答题正确金币飞入 |
| 10.4 | 连击火焰特效 | `components/ComboIndicator.tsx` | 连击 5 次以上冒火 |
| 10.5 | 宠物像素动画 | `components/PetWidget.tsx` | 跳跃/撒花/睡觉 |
| 10.6 | 错误/成功色彩反馈 | 全局 CSS | 绿色闪/红色抖 |
| 10.7 | 新手引导流程（3 步） | `pages/Onboarding.tsx` | 起名→选宠物→第一题 |

**验收标准：** `npm run build` 后部署，手机浏览器能添加到桌面，离线可答题

---

## 四、任务依赖关系图

```
阶段 0 (项目初始化)
    │
    ▼
阶段 1 (核心答题流程) ───────────────┐
    │                                │
    ├──► 阶段 2 (语法题型全覆盖)      │
    ├──► 阶段 3 (词汇系统)            │
    ├──► 阶段 4 (宠物系统) ──────┐   │
    │                            │   │
    ▼                            ▼   ▼
阶段 5 (阅读高塔)           阶段 8 (成就)
    │
    ▼
阶段 6 (听力系统)
    │
    ▼
阶段 7 (智能复习)
    │
    ▼
阶段 9 (题库数据) ← 可与任何阶段并行
    │
    ▼
阶段 10 (PWA + 打磨)
```

**关键路径：** 0 → 1 → 4(宠物) → 6(听力) → 7(复习) → 10

**可以并行的：** 2(语法) + 3(词汇) 可以同时做；5(阅读) + 6(听力) 可以同时做；9(题库) 可全程并行

---

## 五、每个任务的 「完成」标准

| 任务类型 | 完成标准 |
|---|---|
| API 路由 | `curl` 测试返回正确 JSON，状态码 200/201 |
| 数据模型 | Alembic 迁移成功，`sqlite3` 命令行能看到表 |
| 前端页面 | 页面能渲染，按钮能点，数据来自真实 API（非 mock） |
| 游戏机制 | 用户操作 → 后端验证 → 返回结果 → 前段反馈动画 |
| 宠物功能 | 喂食扣金币 → 状态变化 → 数据库持久化（刷新不丢） |
| 音频功能 | 实际播放声音，调速有效，离线缓存后断开网络也能播 |
| 题库数据 | `seed_db.py` 运行后，所有 API 能返回题目 |

---

## 六、风险 & 应对

| 风险 | 可能性 | 应对 |
|---|---|---|
| edge-tts 无法在部署环境运行 | 中 | 备选一：本地生成后上传；备选二：Web Speech API 直接朗读 |
| 宠物像素动画做不出来 | 中 | 先用 CSS 动画代替（跳动/旋转/放大），像素画后面再找画师 |
| 前端拖拽（连连看/完形选词）在手机上卡顿 | 低 | 使用 react-dnd 或 @use-gesture 库 |
| 题库数据量太大 | 低 | 第一批只做 2-3 个语法点验证流程，内容可逐步追加 |
| Web Speech API 在不同手机音质不一 | 低 | 备选 edge-tts 预生成单词 MP3 |

---

## 七、第一周冲刺计划（建议）

| 天 | 做 | 交付 |
|---|---|---|
| 第 1 天 | 阶段 0 (项目初始化) + 阶段 1 (核心答题) | 跑通选择题流程 |
| 第 2 天 | 阶段 2 (语法全覆盖) | 4 种语法题型 |
| 第 3 天 | 阶段 4 (宠物系统 MVP) | 能喂宠物，宠物有反应 |
| 第 4 天 | 阶段 3 (词汇系统) | 词汇森林可玩 |
| 第 5 天 | 阶段 9 (初始题库) | 数据库有内容 |

第 1 周结束 → **孩子能在手机上做一个语法选择题 + 喂宠物** ✅

| 天 | 做 | 交付 |
|---|---|---|
| 第 6-7 天 | 阶段 5 (阅读) + 阶段 6 (听力) | 阅读塔 + 收音机 |
| 第 8 天 | 阶段 7 (复习) | 智能复习 |
| 第 9-10 天 | 阶段 10 (PWA) + 打磨 | 离线 + 动画 |

第 2 周结束 → **完整的 EnglishWorld MVP** ✅
