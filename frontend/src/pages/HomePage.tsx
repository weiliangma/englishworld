import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getDueReviews } from '../services/api';
import { useUserStore } from '../stores/gameStore';

export default function HomePage() {
  const { level, experience, coins, streak, setStats } = useUserStore();
  const [dueCount, setDueCount] = useState(0);
  const expPercent = experience % 100;

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
    getDueReviews().then((data: any) => setDueCount(data.length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {/* Pet Avatar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center text-3xl">
          🐉
        </div>
        <div>
          <div className="text-lg font-bold">Lv.{level} 语法勇士</div>
          <div className="w-32 h-2 bg-gray-600 rounded-full mt-1">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${expPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
        <div className="bg-gray-800 rounded-lg p-2">🔥 {streak}天</div>
        <div className="bg-gray-800 rounded-lg p-2">🪙 {coins}</div>
        <div className="bg-gray-800 rounded-lg p-2">📅 今日3关</div>
      </div>

      {/* Review Alert */}
      {dueCount > 0 && (
        <Link to="/review" className="block bg-yellow-600 rounded-lg p-3 mb-4 text-center animate-pulse">
          ⚠️ 有 {dueCount} 道题待复习 · 点击闪电复习
        </Link>
      )}

      {/* Main CTA */}
      <Link to="/map" className="block bg-green-600 rounded-xl p-6 text-center text-2xl font-bold mb-4 shadow-lg">
        🚀 继续挑战
      </Link>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around p-3 text-xs">
        <Link to="/map" className="text-center">🗺️ 地图</Link>
        <Link to="/pet" className="text-center">🏠 宠物</Link>
        <Link to="/vocab" className="text-center">📒 单词本</Link>
        <Link to="/reading" className="text-center">🗼 阅读塔</Link>
        <Link to="/listening" className="text-center">📻 电波台</Link>
        <Link to="/achievements" className="text-center">🎒 背包</Link>
      </div>
    </div>
  );
}
