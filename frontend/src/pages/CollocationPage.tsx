import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/gameStore';

const PAIRS = [
  { left: 'look', right: 'after', chinese: '照顾' },
  { left: 'take', right: 'care', chinese: '当心' },
  { left: 'depend', right: 'on', chinese: '依赖' },
  { left: 'listen', right: 'to', chinese: '听' },
  { left: 'wait', right: 'for', chinese: '等待' },
];

export default function CollocationPage() {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const { setStats, coins } = useUserStore();

  const handleLeftClick = (left: string) => {
    if (feedback || connected[left]) return;
    setSelectedLeft(left);
  };

  const handleRightClick = (right: string) => {
    if (!selectedLeft || feedback) return;
    const pair = PAIRS.find(p => p.left === selectedLeft);
    if (pair && pair.right === right) {
      setConnected(c => ({ ...c, [selectedLeft]: right }));
      setScore(s => s + 10);
      setStats({ coins: coins + 10 });
    }
    setSelectedLeft(null);
  };

  const allConnected = PAIRS.every(p => connected[p.left] === p.right);

  const unusedLefts = PAIRS.filter(p => !connected[p.left]);
  const usedRights = new Set(Object.values(connected));
  const unusedRights = PAIRS.filter(p => !usedRights.has(p.right));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-lg font-bold mb-2">🔗 词组连连看</h1>
      <div className="flex justify-between mb-4 text-sm">
        <span>{Object.keys(connected).length}/{PAIRS.length} 已配对</span>
        <span className="text-yellow-400">🪙 {score}</span>
      </div>

      <div className="flex gap-8 justify-center items-start mb-6">
        <div className="space-y-3">
          {PAIRS.map(p => (
            <button key={p.left} onClick={() => handleLeftClick(p.left)}
              className={`block w-24 p-3 rounded-lg text-center transition ${
                connected[p.left] ? 'bg-green-700 border border-green-500'
                  : selectedLeft === p.left ? 'bg-blue-700 border border-blue-500'
                  : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
              }`}
              disabled={!!connected[p.left]}>
              {p.left}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {[...unusedRights, ...PAIRS.filter(p => connected[p.left])].map(p => (
            <button key={p.right} onClick={() => handleRightClick(p.right)}
              className={`block w-24 p-3 rounded-lg text-center transition ${
                connected[p.left] === p.right ? 'bg-green-700 border border-green-500'
                  : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
              }`}
              disabled={!!connected[p.left]}>
              {p.right}
            </button>
          ))}
        </div>
      </div>

      {allConnected && (
        <div className="text-center">
          <div className="text-2xl mb-2">🎉 搭配大师！</div>
          <div className="text-sm text-gray-400 mb-4">
            {PAIRS.map(p => `${p.left} ${p.right}（${p.chinese}）`).join('、')}
          </div>
          <Link to="/" className="bg-green-600 rounded-xl px-8 py-3 font-bold inline-block">完成</Link>
        </div>
      )}
    </div>
  );
}
