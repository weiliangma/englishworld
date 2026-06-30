import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReadingTower, getReadingFloor } from '../services/api';

interface Floor {
  id: number; floorNumber: number; difficulty: number; title: string;
  category: string; wordCount: number; isBoss: boolean; questionCount: number;
}

interface Question {
  id: number; questionType: string; questionText: string;
  options: { label: string; text: string }[]; correctAnswer: string; explanation: string;
}

export default function ReadingTowerPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    getReadingTower().then(setFloors).catch(console.error);
  }, []);

  const openFloor = async (floor: Floor) => {
    setCurrentFloor(floor);
    setQIndex(0);
    setFeedback(null);
    setSelected('');
    try {
      const data = await getReadingFloor(floor.id);
      setQuestions(data.questions || []);
    } catch (e) { console.error(e); }
  };

  const q = questions[qIndex];

  const handleSelect = (answer: string) => {
    if (feedback) return;
    setSelected(answer);
    const isCorrect = answer === q.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const next = () => {
    if (feedback === 'correct') {
      setCompleted(c => [...c, qIndex]);
    }
    setFeedback(null);
    setSelected('');
    if (qIndex < questions.length - 1) setQIndex(i => i + 1);
    else {
      setCompleted(c => [...new Set([...c, ...Array.from({length: questions.length}, (_, i) => i)])]);
    }
  };

  // Floor list view
  if (!currentFloor) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
        <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
        <h1 className="text-xl font-bold mb-4">🗼 阅读高塔</h1>
        <div className="space-y-3">
          {[...floors].reverse().map(f => {
            const stars = '⭐'.repeat(f.difficulty);
            const allDone = completed.length === f.questionCount;
            return (
              <button key={f.id} onClick={() => openFloor(f)}
                className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700 text-left hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{allDone ? '✅' : '🧱'} 第{f.floorNumber}层 · {f.title}</div>
                    <div className="text-sm text-gray-400">{stars} {f.wordCount}词</div>
                  </div>
                  <div className="text-xs bg-blue-900 rounded px-2 py-1">
                    {completed.length}/{f.questionCount}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Question view
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button onClick={() => setCurrentFloor(null)} className="text-gray-400 mb-4 block">← 返回楼层</button>
      <div className="text-sm text-gray-400 mb-2">{currentFloor.title}</div>
      <div className="h-2 bg-gray-600 rounded-full mb-4">
        <div className="h-full bg-green-500 rounded-full" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {q && (
        <>
          <div className="bg-gray-800 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto text-sm leading-relaxed">
            {(currentFloor as any).passageText || '阅读文章加载中...'}
          </div>
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <p className="mb-3">{q.questionText}</p>
            {q.options?.map((opt: any) => (
              <button key={opt.label} onClick={() => handleSelect(opt.label)}
                className={`w-full text-left p-3 mb-2 rounded-lg border transition ${
                  feedback ? (opt.label === q.correctAnswer ? 'bg-green-700 border-green-500' : selected === opt.label ? 'bg-red-700 border-red-500' : 'bg-gray-700 border-gray-600')
                    : selected === opt.label ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}>
                {opt.label}. {opt.text}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`rounded-xl p-4 text-center ${feedback === 'correct' ? 'bg-green-800' : 'bg-red-800'}`}>
              {feedback === 'correct' ? <div>🎉 线索匹配！</div> : <div>😅 {q.explanation || '再想想'}</div>}
              <button onClick={next} className="mt-3 bg-white text-black px-6 py-2 rounded-lg font-bold">
                {qIndex < questions.length - 1 ? '下一题' : '🔍 案件告破！'}
              </button>
            </div>
          )}

          {qIndex >= questions.length - 1 && feedback && (
            <button onClick={() => setCurrentFloor(null)} className="w-full mt-2 bg-green-600 rounded-xl p-3 font-bold">
              返回楼层
            </button>
          )}
        </>
      )}
    </div>
  );
}
