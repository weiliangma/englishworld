import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/gameStore';

const QUESTIONS = [
  { sentence: 'This coat _____ me ¥300.', options: ['spent', 'cost', 'paid', 'took'], answer: 'cost',
    tip: 'cost 主语是"物"；spend 主语是"人"；pay 常与 for 搭配；take 用于 It takes...' },
  { sentence: 'Can you _____ me your pen?', options: ['borrow', 'lend', 'keep', 'take'], answer: 'lend',
    tip: 'lend 借出；borrow 借入；keep 保管/借一段时间' },
  { sentence: 'There are _____ apples in the basket.', options: ['a little', 'a few', 'little', 'much'], answer: 'a few',
    tip: 'a few + 可数名词（几个）；a little + 不可数名词（一点）' },
  { sentence: 'He is _____ to come today.', options: ['possible', 'likely', 'maybe', 'perhaps'], answer: 'likely',
    tip: 'likely 可接不定式：be likely to do；possible 用 It is possible to...' },
];

export default function ConfusablePage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
  const { setStats, coins } = useUserStore();
  const q = QUESTIONS[current];

  const handleSelect = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 12);
      setStats({ coins: coins + 12 });
      if (!unlockedCards.includes(q.tip)) {
        setUnlockedCards(c => [...c, q.tip]);
      }
    }
  };

  const next = () => {
    setFeedback(null);
    setSelected('');
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1);
    else setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">⚔️</div>
        <div className="text-2xl font-bold mb-4">辨析训练完成！</div>
        <div className="text-yellow-400 text-xl mb-4">🪙 +{score}</div>
        {unlockedCards.length > 0 && (
          <div className="w-full max-w-md mb-4">
            <div className="font-bold mb-2">💡 获得的辨析卡片：</div>
            {unlockedCards.map((tip, i) => (
              <div key={i} className="bg-blue-900 rounded-xl p-3 mb-2 text-sm">{tip}</div>
            ))}
          </div>
        )}
        <Link to="/" className="bg-green-600 rounded-xl px-8 py-3 font-bold">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-lg font-bold mb-2">⚔️ 易混词对战</h1>
      <div className="text-sm text-gray-400 text-center mb-4">{current + 1}/{QUESTIONS.length}</div>
      <div className="bg-gray-800 rounded-xl p-6 mb-4">
        <p className="text-lg mb-4">{q.sentence}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map(opt => (
            <button key={opt} onClick={() => handleSelect(opt)}
              className={`p-3 rounded-lg border text-center transition ${
                feedback ? (opt === q.answer ? 'bg-green-700 border-green-500' : selected === opt ? 'bg-red-700 border-red-500' : 'bg-gray-700 border-gray-600')
                  : selected === opt ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >{opt}</button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`rounded-xl p-4 mb-4 ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
          {feedback === 'correct' ? <div>🎉 正确！+12🪙</div> : <div>😅 正确答案：{q.answer}</div>}
          <div className="text-xs mt-2 text-gray-300">💡 {q.tip}</div>
          <button onClick={next} className="mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">
            {current < QUESTIONS.length - 1 ? '下一题' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  );
}
