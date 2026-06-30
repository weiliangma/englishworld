import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDueReviews, submitReview } from '../services/api';
import { useUserStore } from '../stores/gameStore';

interface ReviewQ {
  question_id: number;
  type: string;
  content: any;
  stage: number;
}

export default function ReviewPage() {
  const [dueList, setDueList] = useState<ReviewQ[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const { coins, setStats } = useUserStore();

  useEffect(() => {
    getDueReviews().then((data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        setDueList(data);
      } else {
        setFinished(true);
      }
    }).catch(() => setFinished(true));
  }, []);

  const q = dueList[current];
  const content = q?.content;

  const handleSubmit = async (answer: string) => {
    setSelected(answer);
    try {
      const res = await submitReview({ question_id: q.question_id, user_answer: answer });
      setFeedback(res.is_correct ? 'correct' : 'wrong');
      if (res.is_correct) {
        setScore(s => s + res.earned_coins);
        setCorrectCount(c => c + 1);
        setStats({ coins: coins + res.earned_coins });
      }
    } catch (e) { setFeedback('wrong'); }
  };

  const next = () => {
    setFeedback(null);
    setSelected('');
    if (current < dueList.length - 1) setCurrent(c => c + 1);
    else setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-7xl mb-4">{dueList.length === 0 ? '🎉' : '⚡'}</div>
        <div className="text-2xl font-bold mb-2">
          {dueList.length === 0 ? '没有到期复习！' : '闪电复习完成！'}
        </div>
        {dueList.length > 0 && (
          <>
            <div className="text-lg mb-1">{correctCount}/{dueList.length} 正确</div>
            <div className="text-yellow-400 text-xl mb-6">🪙 +{score} (1.5x奖励)</div>
          </>
        )}
        <Link to="/" className="bg-green-600 rounded-xl px-8 py-3 text-lg font-bold">返回首页</Link>
      </div>
    );
  }

  if (!q) return <div className="p-4 text-white">加载中...</div>;

  const isChoice = q.type === 'choice' || q.type === 'reading_choice';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <div className="flex items-center justify-between mb-4">
        <span className="text-yellow-400">⚡ 闪电复习 (1.5x金币)</span>
        <span className="text-sm">{current + 1}/{dueList.length}</span>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-4">
        {isChoice && <p className="text-lg mb-4">{content?.stem}</p>}
        {isChoice && content?.options?.map((opt: any) => (
          <button key={opt.label} onClick={() => handleSubmit(opt.label)}
            disabled={!!feedback}
            className={`w-full text-left p-3 mb-2 rounded-lg border transition ${
              feedback ? (opt.label === content.answer ? 'bg-green-700 border-green-500' : selected === opt.label ? 'bg-red-700 border-red-500' : 'bg-gray-700 border-gray-600')
                : selected === opt.label ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
          >{opt.label}. {opt.text}</button>
        ))}
      </div>

      {feedback && (
        <div className={`rounded-xl p-4 mb-4 text-center ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
          {feedback === 'correct' ? <div>🎉 正确！+15金币</div> : <div>😅 正确答案：{content?.answer}</div>}
          {content?.explanation && <div className="text-xs mt-2 text-gray-300">{content.explanation}</div>}
          <button onClick={next} className="mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">下一题</button>
        </div>
      )}
    </div>
  );
}
