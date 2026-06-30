import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/gameStore';

const SPELL_DATA = [
  { chinese: '温度', word: 'temperature', template: 't e _ p _ _ a t u r e', blanks: [2, 4, 5], letters: ['m', 'e', 'r', 'a', 'i', 'o', 's', 'u'] },
  { chinese: '图书馆', word: 'library', template: 'l i b r _ r _', blanks: [4, 6], letters: ['a', 'y', 'e', 'i', 'o', 'u'] },
  { chinese: '星期三', word: 'wednesday', template: 'w e d n e s d _ y', blanks: [7], letters: ['a', 'e', 'i', 'o', 'u', 'y'] },
  { chinese: '不同的', word: 'different', template: 'd i f f e r e _ t', blanks: [6], letters: ['n', 'm', 'r', 't', 's'] },
  { chinese: '美味的', word: 'delicious', template: 'd e l i c i o _ s', blanks: [6], letters: ['u', 'a', 'e', 'i', 'o'] },
];

export default function VocabSpellPage() {
  const [current, setCurrent] = useState(0);
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { setStats, coins } = useUserStore();

  const item = SPELL_DATA[current];
  const chars = item.template.split(' ');

  const handleLetter = (letter: string) => {
    if (feedback) return;
    const nextBlank = item.blanks.find(b => !(b in filled));
    if (nextBlank === undefined) return;
    setFilled(f => ({ ...f, [nextBlank]: letter }));
  };

  const handleUndo = () => {
    if (feedback) return;
    const blanks = Object.keys(filled).map(Number);
    const last = Math.max(...blanks);
    if (isFinite(last)) {
      setFilled(f => { const n = { ...f }; delete n[last]; return n; });
    }
  };

  const handleSubmit = () => {
    const answer = chars.map((c, i) => {
      if (c === '_') return filled[i] || '_';
      return c;
    }).join('');
    const isCorrect = answer.replace(/\s/g, '') === item.word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 15);
      setStats({ coins: coins + 15 });
    }
  };

  const next = () => {
    setFeedback(null);
    setFilled({});
    if (current < SPELL_DATA.length - 1) setCurrent(c => c + 1);
    else setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">✍️</div>
        <div className="text-2xl font-bold mb-2">拼写完成！</div>
        <div className="text-yellow-400 text-xl mb-6">🪙 +{score}</div>
        <Link to="/" className="bg-green-600 rounded-xl px-8 py-3 font-bold">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-lg font-bold mb-2">✍️ 单词拼写</h1>
      <div className="text-center text-3xl mb-2">{item.chinese}</div>
      <div className="text-center text-sm text-gray-400 mb-4">{current + 1}/{SPELL_DATA.length}</div>

      <div className="flex justify-center gap-1 mb-6 text-2xl font-mono">
        {chars.map((c, i) => (
          <span key={i} className={`w-8 h-10 flex items-center justify-center border-b-2 rounded ${
            c === '_'
              ? filled[i] ? 'bg-green-900 border-green-500' : 'border-gray-500'
              : 'border-transparent'
          }`}>
            {c === '_' ? (filled[i]?.toUpperCase() || '_') : c.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {item.letters.map(l => (
          <button key={l} onClick={() => handleLetter(l)}
            className="w-10 h-10 bg-gray-700 rounded-lg text-lg hover:bg-gray-600">
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-center mb-4">
        <button onClick={handleUndo} className="bg-gray-700 rounded-lg px-4 py-2 text-sm">↩ 撤销</button>
        <button onClick={handleSubmit}
          className="bg-blue-600 rounded-lg px-4 py-2 font-bold disabled:opacity-50"
          disabled={Object.keys(filled).length < item.blanks.length}>确认</button>
      </div>

      {feedback && (
        <div className={`rounded-xl p-4 text-center ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
          {feedback === 'correct' ? <div>🎉 拼写完美！+15🪙</div> : <div>😅 正确答案：{item.word}</div>}
          <button onClick={next} className="mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">下一题</button>
        </div>
      )}
    </div>
  );
}
