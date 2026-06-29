# EnglishWorld — 听力和发音技术方案

> 🔊 Listening 🔊 如何让 12 岁男生在手机上"收听"英文并做题

---

## 一、单词发音（简单，马上能搞定）

### 方案选型对比

| 方案 | 成本 | 离线 | 音质 | 实现难度 |
|---|---|---|---|---|
| **Web Speech API** | 免费 | ✅ | ⭐⭐⭐ 取决于系统 | ⭐ 一行代码 |
| **edge-tts 生成 MP3** | 免费 | ✅ 缓存后 | ⭐⭐⭐⭐⭐ 媲美真人 | ⭐⭐ 批量生成一次 |
| **OpenAI TTS** | ¥0.15/次 | ❌ | ⭐⭐⭐⭐⭐ | ⭐ |
| **本地 TTS** | 免费 | ✅ | ⭐⭐ 机械感 | ⭐⭐⭐ |

### 推荐方案：Web Speech API（零成本，立即生效）

浏览器自带的语音合成，不需要任何后端，不需要花钱。

```javascript
// 点词发音 — 就这一行
function speak(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = 0.9;  // 稍慢，清晰
  speechSynthesis.speak(utter);
}
```

**放在哪里用：**
- 词义射击 → 答对/答错后自动发音
- 单词收集册 → 点击单词卡片发音
- 拼写题 → 拼完后发音
- 阅读理解 → 文章中的词点击查义 + 发音

**离线也能用：** PWA 缓存后，Web Speech API 用的是操作系统本地语音库，不需要联网。

---

## 二、听力模块（核心方案）

### 核心问题：音频从哪来？

听力需要一段英文录音 + 对应的题目。有两种方式生成录音：

### 方案对比

| 方案 | 成本 | 质量 | 灵活性 | 推荐场景 |
|---|---|---|---|---|
| **A. edge-tts 生成** | **免费** | ⭐⭐⭐⭐⭐ | 极高，任意文本都能生成 | **⭐ 首选** |
| B. 真人录音 | 贵（¥500+/篇） | ⭐⭐⭐⭐⭐ | 低，录好不能改 | 不推荐 |
| C. Open API TTS | 付费 | ⭐⭐⭐⭐⭐ | 高 | 备用 |

### 推荐方案 A：edge-tts（免费、微软神经网络语音）

**edge-tts** 是 Python 库，调用微软 Edge 浏览器内置的免费神经 TTS 引擎。音质接近真人，支持多种美式/英式发音人。

```python
# 安装
# pip install edge-tts

# 生成一段听力录音
import edge_tts

text = """
Tom and his mother went to the zoo last Sunday.
They saw many animals there.
Tom's favorite animal was the panda.
The panda was eating bamboo happily.
"""

voice = "en-US-JennyNeural"  # 美式女声，清晰标准
output = "listening_zoo.mp3"

await edge_tts.Communicate(text, voice).save(output)
# 生成一个 MP3 文件，大小约 200KB（30秒录音）
```

**支持的发音人（适合初中听力）：**
| 发音人 | 风格 | 语速 |
|---|---|---|
| en-US-JennyNeural | 美式女声，清晰标准 | ⭐⭐⭐ 适合 |
| en-US-GuyNeural | 美式男声，友好 | ⭐⭐⭐ 适合 |
| en-GB-SoniaNeural | 英式女声，优雅 | ⭐⭐ 中考也用 |
| en-US-AriaNeural | 美式女声，活泼 | ⭐⭐⭐ 最适合12岁男生 |

### 听力音频生产流程

```
写文本 → edge-tts 生成 MP3 → 存到 /backend/audio/ 
→ 前端 <audio> 播放 → 学生听完做题
```

一次性生成，永久使用。1600 个单词 + 30 篇听力短文，全部生成约需 15 分钟（批处理）。

### 前端播放控制

```jsx
// 听力播放器组件
function ListeningPlayer({ audioSrc }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const play = () => {
    audioRef.current.play();
    setPlaying(true);
  };

  // 支持：播放/暂停/重听/进度条拖拽
  // 支持：变速播放（0.75x / 1x / 1.25x）
  // 支持：自动播放完整篇

  return (
    <div className="listening-player">
      {/* 复古收音机 UI */}
      <audio ref={audioRef} src={audioSrc} />
      <button onClick={play}>▶ 收听</button>
      <span>{currentTime}s</span>
    </div>
  );
}
```

---

## 三、数据模型（需要新增的表）

```sql
-- 🔊 听力题库
CREATE TABLE listening_passages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                       -- "动物园游记"
    topic TEXT NOT NULL,                       -- daily_life / school / travel / nature
    difficulty INTEGER DEFAULT 1,              -- 1-3
    audio_file TEXT NOT NULL,                  -- "audio/listening_zoo.mp3"
    transcript TEXT NOT NULL,                  -- 录音原文（用于答完显示）
    word_count INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🔊 听力题目
CREATE TABLE listening_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passage_id INTEGER REFERENCES listening_passages(id),
    question_type TEXT NOT NULL,               -- picture_selection / dialogue / true_false / fill_blank
    question_text TEXT NOT NULL,               -- "汤姆最喜欢的动物是什么？"
    options TEXT NOT NULL,                     -- JSON
    correct_answer TEXT NOT NULL,
    image_file TEXT DEFAULT NULL,              -- 图片选择题的图片路径
    explanation TEXT DEFAULT NULL,
    sort_order INTEGER DEFAULT 0
);

-- 🔊 单词音频缓存（可选，不用 Web Speech API 时用）
CREATE TABLE word_audio (
    word TEXT PRIMARY KEY,                     -- "adventure"
    audio_file TEXT NOT NULL,                  -- "audio/words/adventure.mp3"
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 四、边缘情况处理

| 情况 | 处理方式 |
|---|---|
| 用户手机静音 | 播放前检测静音模式，提示"听不到声音？检查手机音量" |
| 音频加载慢 | MP3 文件小（30秒 ≈ 200KB），PWA 可预缓存 |
| edge-tts 生成失败 | 重试两次，失败则标记为题目标记为"待重生成" |
| 单词太多（1600个） | 按主题分批生成，后台任务队列处理 |
| 浏览器不支持 Web Speech API | 极少数老手机，降级为显示音标 |
| 听力倍速需求 | 支持 0.75x / 1x / 1.25x，适合不同水平 |

---

## 五、一句话总结

> **单词发音 → 浏览器原生 Web Speech API，零成本，一行代码。**  
> **听力录音 → edge-tts 免费生成 MP3，音质媲美真人，批处理一次永久使用。**
