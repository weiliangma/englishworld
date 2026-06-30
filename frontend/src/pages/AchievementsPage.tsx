import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAchievements } from '../services/api';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    getAchievements().then((data: any) => {
      if (Array.isArray(data)) setAchievements(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-xl font-bold mb-4">🎖️ 勋章墙</h1>
      <div className="grid grid-cols-2 gap-3">
        {achievements.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 mt-10">
            <div className="text-6xl mb-4">🏅</div>
            <p>继续努力，勋章在等你！</p>
          </div>
        )}
        {achievements.map((ach: any) => (
          <div key={ach.id} className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <div className="text-3xl mb-2">{ach.icon || '🏅'}</div>
            <div className="font-bold text-sm">{ach.display_name}</div>
            <div className="text-xs text-gray-400 mt-1">{ach.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
