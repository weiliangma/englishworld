import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWrongBook } from '../services/api';
import { useUserStore } from '../stores/gameStore';

export default function WrongBookPage() {
  const [items, setItems] = useState<any[]>([]);
  const { coins } = useUserStore();

  useEffect(() => {
    getWrongBook().then((data: any) => {
      if (Array.isArray(data)) setItems(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🏆 战利品宝库</h1>
        <span className="text-yellow-400">🪙 {coins}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <div className="text-6xl mb-4">🎉</div>
          <p>还没有战利品！</p>
          <p className="text-sm mt-2">做错的题会自动出现在这里</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">💀 错 {item.wrong_count} 次</div>
                  <div className="text-xs text-gray-500">#{item.question_id}</div>
                </div>
                <span className="text-xs bg-red-900 rounded px-2 py-1">未掌握</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
