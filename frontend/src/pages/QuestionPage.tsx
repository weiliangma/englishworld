import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuestions, submitAnswer } from '../services/api';
import { useGameStore, useUserStore } from '../stores/gameStore';

interface Question {
  id: number;
  question_type: string;
  content: any;
}

export default function QuestionPage() {
  const { skillId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<any>(null);
  const startTime = useRef(Date.now());
  const { combo, incrementCombo, resetCombo, addCoins } = useGameStore();
  const { setStats, coins } = useUserStore();

  useEffect(() => {
    if (skillId) getQuestions(Number(skillId)).then(setQuestions);
  }, [skillId]);

  const q = questions[current];
  const content = q?.content;

  // Timer
  useEffect(() => {
    if (!q || feedback) return;
    setTimeLeft(10);
    startTime.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit('');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, q?.id]);

  const handleSubmit = useCallback(async (answer: string) => {
    clearInterval(timerRef.current);
    const timeSpent = Date.now() - startTime.current;
    try {
      const res = await submitAnswer({
        question_id: q!.id,
        user_answer: answer || 'timeout',
        time_spent: timeSpent,
      });
      setFeedback(res.is_correct ? 'correct' : 'wrong');
      if (res.is_correct) {
        incrementCombo();
        addCoins(res.earned_coins);
        setStats({ coins: coins + res.earned_coins });
      } else {
        resetCombo();
      }
    } catch (e) {
      console.error(e);
    }
  }, [q, feedback]);

  const nextQuestion = () => {
    setFeedback(null);
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    }
  };

  if (!q) return <div className="p-4 text-white">加载中...</div>;

  const isChoice = q.question_type === 'choice';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <Link to="/map" className="text-gray-400 mb-4 block">← 返回</Link>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 bg-gray-600 rounded-full">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm">{current + 1}/{questions.length}</span>
        {combo >= 5 && <span className="text-orange-400">🔥 x{combo}</span>}
      </div>

      {/* Timer */}
      <div className="text-center mb-4">
        <div className="text-2xl font-mono">{timeLeft}s</div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4">
        {isChoice && <p className="text-lg mb-4">{content?.stem}</p>}

        {isChoice && content?.options?.map((opt: any) => (
          <button
            key={opt.label}
            onClick={() => { setSelected(opt.label); handleSubmit(opt.label); }}
            disabled={!!feedback}
            className={`w-full text-left p-3 mb-2 rounded-lg border transition ${
              feedback
                ? opt.label === content.answer
                  ? 'bg-green-700 border-green-500'
                  : selected === opt.label
                    ? 'bg-red-700 border-red-500'
                    : 'bg-gray-700 border-gray-600'
                : selected === opt.label
                  ? 'bg-blue-700 border-blue-500'
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
          >
            {opt.label}. {opt.text}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-xl p-4 mb-4 text-center ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
          {feedback === 'correct' ? (
            <div>
              <div className="text-2xl">🎉 Nice！</div>
              <div className="text-sm mt-1">+{10 + (combo >= 10 ? 10 : combo >= 5 ? 5 : 0)} 金币</div>
              {content?.explanation && <div className="text-xs mt-2 text-gray-300">{content.explanation}</div>}
            </div>
          ) : (
            <div>
              <div className="text-2xl">差一点！</div>
              <div className="text-sm mt-1">正确答案：{content?.answer}</div>
              {content?.explanation && <div className="text-xs mt-2 text-gray-300">{content.explanation}</div>}
            </div>
          )}
          {current < questions.length - 1 && (
            <button onClick={nextQuestion} className="mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">
              下一题
            </button>
          )}
          {current >= questions.length - 1 && (
            <Link to="/map" className="block mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">
              回到地图
            </Link>
          )}
        </div>
      )}

      {/* Coin display */}
      <div className="fixed top-4 right-4 bg-yellow-600 rounded-full px-3 py-1 text-sm">
        🪙 {coins}
      </div>
    </div>
  );
}
