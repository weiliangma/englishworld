# EnglishWorld — 题库样例数据 (JSON)

> 每种题型的 JSON 数据结构示例，供开发者参考

---

## 一、单项选择（4.1 秒杀模式）

```json
{
  "id": 1001,
  "skill_id": 1,
  "question_type": "choice",
  "difficulty": 1,
  "content": {
    "stem": "The boy _____ to school by bus every day.",
    "options": [
      { "label": "A", "text": "go" },
      { "label": "B", "text": "goes" },
      { "label": "C", "text": "went" },
      { "label": "D", "text": "going" }
    ],
    "answer": "B",
    "explanation": "主语 The boy 是第三人称单数，时态是一般现在时（every day），所以动词加 -es。",
    "time_limit": 10,
    "coin_reward": 10
  },
  "source": "manual",
  "exam_year": 2024
}
```

---

## 二、词形转换（4.2 极速拼装）

```json
{
  "id": 2001,
  "skill_id": 2,
  "question_type": "word_form",
  "difficulty": 2,
  "content": {
    "stem": "It is _____ (danger) to swim alone in the river.",
    "base_word": "danger",
    "correct_form": "dangerous",
    "suffix_pool": ["ous", "ly", "ed", "ing", "tion", "ful"],
    "hint": "形容词，意思是'危险的'",
    "explanation": "danger（名词，危险）+ ous → dangerous（形容词，危险的）。",
    "coin_reward": 12
  },
  "source": "manual"
}
```

---

## 三、句型转换（4.3 语法手术）

```json
{
  "id": 3001,
  "skill_id": 3,
  "question_type": "sentence_transform",
  "difficulty": 2,
  "content": {
    "original": "Tom is reading a book in the library.",
    "instruction": "改为否定句",
    "answer": "Tom is not reading a book in the library.",
    "steps": [
      "找到系动词 is",
      "在 is 后面加 not",
      "其余部分不变"
    ],
    "explanation": "含有 be 动词的句子变否定句，直接在 be 动词后加 not。",
    "coin_reward": 15
  },
  "source": "manual"
}
```

---

## 四、完形填空 · 选词填空（4.4 类型 A）

```json
{
  "id": 4001,
  "skill_id": 1,
  "question_type": "cloze_word_selection",
  "difficulty": 2,
  "content": {
    "title": "My School Day",
    "passage": "I {{0}} at 7:00 every morning. After breakfast, I {{1}} to school. My home is {{2}} from school, so I walk there. I have six classes a day. I {{3}} English very much because it is interesting.",
    "blanks": [
      { "index": 0, "answer": "get up" },
      { "index": 1, "answer": "go" },
      { "index": 2, "answer": "near" },
      { "index": 3, "answer": "like" }
    ],
    "word_bank": ["get up", "go", "near", "like", "far", "leave", "arrive", "enjoy", "have", "start"],
    "interference": ["far", "leave", "arrive", "enjoy"],
    "explanation": "第1空：get up 起床；第2空：go to school 去上学；第3空：near 离……近；第4空：like 喜欢。"
  }
}
```

---

## 五、完形填空 · 四选一（4.4 类型 B）

```json
{
  "id": 4002,
  "skill_id": 3,
  "question_type": "cloze_multiple_choice",
  "difficulty": 3,
  "content": {
    "title": "A Kind Stranger",
    "passage": "Last Sunday, Tom {{0}} his wallet on the bus. He was very {{1}}. A kind old man {{2}} it and gave it back to him. Tom was so {{3}} that he thanked the man again and again.",
    "blanks": [
      {
        "index": 0,
        "options": [
          { "label": "A", "text": "lose" },
          { "label": "B", "text": "lost" },
          { "label": "C", "text": "will lose" },
          { "label": "D", "text": "is losing" }
        ],
        "answer": "B",
        "explanation": "Last Sunday 表示过去，用一般过去时 lost。"
      },
      {
        "index": 1,
        "options": [
          { "label": "A", "text": "happy" },
          { "label": "B", "text": "excited" },
          { "label": "C", "text": "worried" },
          { "label": "D", "text": "bored" }
        ],
        "answer": "C",
        "explanation": "丢了钱包应该很担心，选 worried。"
      },
      {
        "index": 2,
        "options": [
          { "label": "A", "text": "picked" },
          { "label": "B", "text": "picked up" },
          { "label": "C", "text": "picking" },
          { "label": "D", "text": "pick" }
        ],
        "answer": "B",
        "explanation": "pick up 捡起，过去时 picked up。"
      },
      {
        "index": 3,
        "options": [
          { "label": "A", "text": "such" },
          { "label": "B", "text": "so" },
          { "label": "C", "text": "very" },
          { "label": "D", "text": "too" }
        ],
        "answer": "B",
        "explanation": "so...that... 如此……以至于……，固定结构。"
      }
    ],
    "coin_reward_per_blank": 12
  }
}
```

---

## 六、词义射击（4.6）

```json
{
  "id": 5001,
  "skill_id": 101,
  "question_type": "vocab_shoot",
  "difficulty": 1,
  "content": {
    "chinese": "冒险",
    "correct_word": "adventure",
    "options": ["adventure", "advantage", "advertisement", "advent"],
    "time_limit": 6,
    "coin_reward": 8,
    "audio": "audio/words/adventure.mp3"
  }
}
```

---

## 七、单词拼写（4.7）

```json
{
  "id": 6001,
  "skill_id": 102,
  "question_type": "vocab_spell",
  "difficulty": 2,
  "content": {
    "chinese": "温度",
    "word": "temperature",
    "template": "t e _ p _ _ a t u r e",
    "available_letters": ["a", "e", "i", "m", "o", "r", "s", "u", "w", "z"],
    "correct_letters": ["m", "e", "r"],
    "blank_positions": [2, 4, 5],
    "coin_reward": 10,
    "audio": "audio/words/temperature.mp3"
  }
}
```

---

## 八、词组连连看（4.8）

```json
{
  "id": 7001,
  "skill_id": 103,
  "question_type": "collocation",
  "difficulty": 2,
  "content": {
    "pairs": [
      { "left": "look", "right": "after", "collocation": "look after", "chinese": "照顾" },
      { "left": "take", "right": "care", "collocation": "take care", "chinese": "当心" },
      { "left": "depend", "right": "on", "collocation": "depend on", "chinese": "依赖" },
      { "left": "listen", "right": "to", "collocation": "listen to", "chinese": "听" }
    ],
    "left_items": ["look", "take", "depend", "listen"],
    "right_items": ["after", "care", "on", "to"],
    "coin_reward": 15
  }
}
```

---

## 九、易混词辨析（4.9）

```json
{
  "id": 8001,
  "skill_id": 104,
  "question_type": "confusable",
  "difficulty": 3,
  "content": {
    "sentence": "This coat _____ me ¥300.",
    "options": [
      { "label": "A", "text": "spent" },
      { "label": "B", "text": "cost" },
      { "label": "C", "text": "paid" },
      { "label": "D", "text": "took" }
    ],
    "answer": "B",
    "group_id": 1,
    "tip_card": {
      "title": "spend / cost / pay / take",
      "points": [
      "cost 的主语是'物'：This coat cost me ¥300.",
      "spend 的主语是'人'：I spent ¥300 on this coat.",
      "pay 常与 for 搭配：I paid ¥300 for this coat.",
      "take 用于 It takes + 时间：It took me two hours."
      ]
    },
    "coin_reward": 12
  }
}
```

---

## 十、阅读理解 · 选择题（4.11 类型 A）

```json
{
  "id": 9001,
  "floor_id": 1,
  "question_type": "reading_choice",
  "difficulty": 1,
  "content": {
    "title": "Octopuses",
    "category": "animal",
    "passage": "Octopuses have three hearts. Two hearts pump blood to the gills. One heart pumps blood to the body. Octopuses also have blue blood. They are very smart animals. They can open jars and solve problems.",
    "word_count": 42,
    "word_hints": {
      "octopus": "章鱼",
      "heart": "心脏",
      "pump": "泵送",
      "gill": "鳃",
      "jar": "罐子"
    },
    "questions": [
      {
        "index": 1,
        "question": "How many hearts does an octopus have?",
        "options": [
          { "label": "A", "text": "One" },
          { "label": "B", "text": "Two" },
          { "label": "C", "text": "Three" },
          { "label": "D", "text": "Four" }
        ],
        "answer": "C",
        "explanation": "文章第一句：Octopuses have three hearts."
      },
      {
        "index": 2,
        "question": "What color is an octopus's blood?",
        "options": [
          { "label": "A", "text": "Red" },
          { "label": "B", "text": "Blue" },
          { "label": "C", "text": "Green" },
          { "label": "D", "text": "White" }
        ],
        "answer": "B",
        "explanation": "文章提到：Octopuses also have blue blood."
      },
      {
        "index": 3,
        "question": "Which is TRUE about octopuses?",
        "options": [
          { "label": "A", "text": "They are not very smart." },
          { "label": "B", "text": "They cannot open jars." },
          { "label": "C", "text": "They have three hearts." },
          { "label": "D", "text": "They have red blood." }
        ],
        "answer": "C",
        "explanation": "A/B 与原文相反，D 错误，选 C。"
      }
    ],
    "fun_fact": "章鱼的血液是蓝色的，因为它们的血液中含有血蓝蛋白，而不是血红蛋白。",
    "coin_reward": 30
  }
}
```

---

## 十一、阅读理解 · 判断正误（4.11 类型 B）

```json
{
  "id": 9002,
  "floor_id": 3,
  "question_type": "reading_true_false",
  "difficulty": 2,
  "content": {
    "title": "Video Game History",
    "category": "tech",
    "passage": "The first video game was made in 1958. It was a simple tennis game. In 1972, the first home video game console was made. Nintendo, a Japanese company, made the first handheld game console in 1980. Today, video games are very popular all over the world.",
    "word_count": 55,
    "word_hints": {
      "video game": "电子游戏",
      "console": "游戏机",
      "handheld": "手持的",
      "popular": "流行的"
    },
    "questions": [
      {
        "index": 1,
        "sentence": "The first video game was made in 1972.",
        "answer": "F",
        "explanation": "文章说第一个电子游戏是 1958 年制造的，不是 1972 年。"
      },
      {
        "index": 2,
        "sentence": "Nintendo is a Japanese company.",
        "answer": "T",
        "explanation": "文章明确提到 Nintendo, a Japanese company。"
      },
      {
        "index": 3,
        "sentence": "The first handheld game console was made in 1980.",
        "answer": "T",
        "explanation": "文章说 1980 年任天堂制造了第一个手持游戏机。"
      }
    ],
    "fun_fact": "世界上第一款家用游戏机叫 Magnavox Odyssey，售价 100 美元。",
    "coin_reward": 25
  }
}
```

---

## 十二、阅读理解 · 简答选择（4.11 类型 C）

```json
{
  "id": 9003,
  "floor_id": 2,
  "question_type": "reading_short_answer",
  "difficulty": 2,
  "content": {
    "title": "Yao Ming's Childhood",
    "category": "sports",
    "passage": "Yao Ming was born in Shanghai in 1980. Both of his parents were basketball players. He started playing basketball at age 9. He was very tall even as a child. He worked hard every day. Later, he became one of the best basketball players in the world.",
    "word_count": 50,
    "word_hints": {
      "basketball": "篮球",
      "player": "运动员，选手",
      "tall": "高的",
      "became": "成为"
    },
    "questions": [
      {
        "index": 1,
        "question": "Where was Yao Ming born?",
        "options": [
          { "label": "A", "text": "Beijing" },
          { "label": "B", "text": "Shanghai" },
          { "label": "C", "text": "Guangzhou" },
          { "label": "D", "text": "Shenzhen" }
        ],
        "answer": "B"
      },
      {
        "index": 2,
        "question": "When did Yao Ming start playing basketball?",
        "options": [
          { "label": "A", "text": "At age 7" },
          { "label": "B", "text": "At age 8" },
          { "label": "C", "text": "At age 9" },
          { "label": "D", "text": "At age 10" }
        ],
        "answer": "C"
      }
    ],
    "fun_fact": "姚明 14 岁时身高就已经达到 196 厘米！",
    "coin_reward": 25
  }
}
```

---

## 十三、听力 · 听句选图（4.12）

```json
{
  "id": 10001,
  "passage_id": 1,
  "question_type": "picture_selection",
  "difficulty": 1,
  "content": {
    "audio_file": "audio/listening/picture_01.mp3",
    "audio_text": "The girl is reading a book under the tree.",
    "images": [
      { "label": "A", "file": "img/listening/p1a.png", "description": "女孩在树下读书" },
      { "label": "B", "file": "img/listening/p1b.png", "description": "女孩在操场上跑步" },
      { "label": "C", "file": "img/listening/p1c.png", "description": "女孩在教室里写字" }
    ],
    "answer": "A",
    "explanation": "录音说的是 The girl is reading a book under the tree.",
    "coin_reward": 8
  }
}
```

---

## 十四、听力 · 短对话问答（4.12）

```json
{
  "id": 10002,
  "passage_id": 2,
  "question_type": "dialogue",
  "difficulty": 2,
  "content": {
    "audio_file": "audio/listening/dialogue_01.mp3",
    "audio_script": "W: Tom, what time do you get up every day?\nM: I get up at 6:30. Then I have breakfast at 7:00.",
    "questions": [
      {
        "index": 1,
        "question": "What time does Tom get up?",
        "options": [
          { "label": "A", "text": "6:00" },
          { "label": "B", "text": "6:30" },
          { "label": "C", "text": "7:00" },
          { "label": "D", "text": "7:30" }
        ],
        "answer": "B",
        "explanation": "Tom 说 I get up at 6:30。"
      }
    ],
    "coin_reward": 10
  }
}
```

---

## 十五、听力 · 短文填词（4.12）

```json
{
  "id": 10003,
  "passage_id": 3,
  "question_type": "fill_blank",
  "difficulty": 3,
  "content": {
    "audio_file": "audio/listening/fill_01.mp3",
    "audio_script": "Tom went to the zoo with his mother last Sunday. He saw many animals there. His favorite was the panda. The panda was eating bamboo happily.",
    "passage_with_blanks": "Tom went to the {{0}} with his {{1}} last Sunday. He saw many {{2}} there. His favorite was the {{3}}.",
    "blanks": [
      { "index": 0, "answer": "zoo", "options": ["zoo", "park", "school", "cinema"] },
      { "index": 1, "answer": "mother", "options": ["father", "mother", "friend", "teacher"] },
      { "index": 2, "answer": "animals", "options": ["animals", "people", "trees", "cars"] },
      { "index": 3, "answer": "panda", "options": ["panda", "tiger", "elephant", "monkey"] }
    ],
    "coin_reward": 12
  }
}
```

---

## 十六、Boss 战（4.5 综合）

```json
{
  "id": 99001,
  "skill_id": 1,
  "question_type": "boss",
  "difficulty": 3,
  "content": {
    "boss_name": "时态龙",
    "boss_hp": 10,
    "questions": [
      {
        "index": 1,
        "type": "choice",
        "stem": "She _____ to the park yesterday.",
        "options": ["goes", "went", "will go", "is going"],
        "answer": "went",
        "explanation": "yesterday 是一般过去时标志词。"
      },
      {
        "index": 2,
        "type": "word_form",
        "stem": "The _____ (win) of the game was very happy.",
        "base_word": "win",
        "correct_form": "winner",
        "explanation": "win → winner（获胜者）。"
      },
      {
        "index": 3,
        "type": "sentence_transform",
        "original": "They are playing football now.",
        "instruction": "改为否定句",
        "answer": "They are not playing football now."
      }
    ],
    "coin_reward": 50,
    "bonus_coin_for_perfect": 30
  }
}
```

---

## 数据结构通用规则

```
所有题目 JSON 通用字段：
- id: 唯一标识
- question_type: 题型标识（见 ARCH.md 枚举）
- difficulty: 1-3
- content: 题型具体内容（结构见上方各示例）
- source: manual / ai_generated / past_exam
- exam_year: 如果是中考真题，标注年份

答题记录：
- question_id + user_answer + is_correct + time_spent + combo_at_time + earned_coins
```
