import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSkills } from '../services/api';

interface Skill {
  id: number;
  name: string;
  display_name: string;
  category: string;
  difficulty: number;
  boss_name: string | null;
}

const AREA_ICONS: Record<string, string> = {
  grammar: '🗡️',
  vocab: '📖',
  reading: '📚',
  cloze: '🏃',
};

const AREA_NAMES: Record<string, string> = {
  grammar: '语法大陆',
  vocab: '词汇森林',
  reading: '阅读高塔',
  cloze: '迷宫逃脱',
};

export default function MapPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tab, setTab] = useState('grammar');

  useEffect(() => {
    getSkills().then(setSkills).catch(console.error);
  }, []);

  const filtered = skills.filter((s) => s.category === tab);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-xl font-bold mb-4">世界地图</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['grammar', 'vocab', 'reading', 'cloze'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm ${tab === t ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            {AREA_ICONS[t]} {AREA_NAMES[t]}
          </button>
        ))}
      </div>

      {/* Skill List */}
      <div className="space-y-3">
        {filtered.map((skill) => (
          <Link
            key={skill.id}
            to={`/skill/${skill.id}`}
            className="block bg-gray-800 rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{skill.display_name}</div>
                <div className="text-sm text-gray-400">
                  {'⭐'.repeat(skill.difficulty)}
                </div>
              </div>
              {skill.boss_name && (
                <div className="text-xs bg-red-900 rounded px-2 py-1">🐉 {skill.boss_name}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
