import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getQuestions, submitAnswer } from '../services/api';
import { useGameStore, useUserStore } from '../stores/gameStore';

interface VocabQuestion {
  id: number;
  question_type: string;
  content: {
    chinese: string;
    correct_word: string;
    options: string[];
    time_limit: number;
    coin_reward: number;
  };
}

export default function VocabShootPage() {
  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(6);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<any>(null);
  const startTime = useRef(Date.now());
  const { combo, incrementCombo, resetCombo } = useGameStore();
  const { coins, setStats } = useUserStore();

  useEffect(() => {
    // 加载词汇射击题目（skill_id=5 是词汇）
    getQuestions(5).then((data: any) => {
      const shootQ = data.filter((q: any) => q.question_type === 'vocab_shoot');
      setQuestions(shootQ);
      setTimeLeft(shootQ[0]?.content?.time_limit || 6);
    }).catch(console.error);
  }, []);

  const q = questions[current];

  // 倒计时
  useEffect(() => {
    if (!q || feedback || finished) return;
    setTimeLeft(q.content.time_limit || 6);
    startTime.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSelect('');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, q?.id, finished]);

  const handleSelect = useCallback(async (answer: string) => {
    if (feedback) return;
    clearInterval(timerRef.current);
    const timeSpent = Date.now() - startTime.current;
    const isCorrect = answer.toUpperCase() === q.content.correct_word.toUpperCase();
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      incrementCombo();
      const bonus = combo >= 5 ? (combo >= 10 ? q.content.coin_reward : Math.floor(q.content.coin_reward * 0.5)) : 0;
      const totalEarned = q.content.coin_reward + bonus;
      setScore((s) => s + totalEarned);
      setStats({ coins: coins + totalEarned });
    } else {
      resetCombo();
    }
  }, [q, feedback, combo, coins]);

  const nextQuestion = () => {
    setFeedback(null);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        加载中...
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🎯</div>
        <div className="text-2xl font-bold mb-2">射击完成！</div>
        <div className="text-lg mb-1">正确率：{Math.round((score / (questions.length * (questions[0]?.content?.coin_reward || 8))) * 100)}%</div>
        <div className="text-yellow-400 text-xl mb-6">🪙 +{score} 金币</div>
        <Link to="/" className="bg-green-600 rounded-xl px-8 py-3 text-lg font-bold">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/map" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-lg font-bold mb-2">🔫 词义射击 · 动物乐园</h1>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span>{current + 1} / {questions.length}</span>
        <span>🪙 {score}</span>
        {combo >= 5 && <span className="text-orange-400">🔥 x{combo}</span>}
      </div>

      {/* Target word (Chinese) */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2">{q.content.chinese}</div>
        <div className={`text-2xl font-mono ${timeLeft <= 3 ? 'text-red-400' : 'text-gray-400'}`}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* Options (English words flying in) */}
      <div className="space-y-3">
        {q.content.options.map((word) => (
          <button
            key={word}
            onClick={() => handleSelect(word)}
            disabled={!!feedback}
            className={`w-full text-left p-4 rounded-xl text-lg font-mono border-2 transition-all ${
              feedback
                ? word === q.content.correct_word
                  ? 'bg-green-800 border-green-500 scale-105'
                  : 'bg-gray-800 border-gray-600 opacity-50'
                : 'bg-gray-800 border-gray-600 hover:border-yellow-500 hover:scale-102'
            }`}
          >
            {word}
          </button>
        ))}
      </div>

      {/* FeedBack */}
      {feedback && (
        <div className={`mt-4 rounded-xl p-4 text-center ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
          {feedback === 'correct' ? (
            <div>
              <div className="text-2xl">💥 命中！</div>
              <div className="text-sm mt-1">+{q.content.coin_reward + (combo >= 5 ? (combo >= 10 ? q.content.coin_reward : Math.floor(q.content.coin_reward * 0.5)) : 0)} 金币</div>
            </div>
          ) : (
            <div>
              <div className="text-2xl">😅 没打中</div>
              <div className="text-sm mt-1">正确答案：{q.content.correct_word}</div>
            </div>
          )}
          <button onClick={nextQuestion} className="mt-3 bg-white text-black px-8 py-2 rounded-lg font-bold">
            {current < questions.length - 1 ? '下一题' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  );
}
