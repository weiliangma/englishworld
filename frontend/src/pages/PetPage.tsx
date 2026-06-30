import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPet, feedPet, playPet, cleanPet, sleepPet, getPetShop, buyPetItem } from '../services/api';
import { useUserStore } from '../stores/gameStore';

interface PetData {
  species: string;
  pet_name: string;
  evolution_stage: number;
  level: number;
  skin_id: number;
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
    cleanliness: number;
    is_sick: boolean;
  };
}

interface ShopItem {
  id: number;
  item_type: string;
  item_name: string;
  item_cost: number;
  equipped: boolean;
  purchased: boolean;
}

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉',
  swordsman: '🗡️',
  mage: '🪄',
  ghost: '👻',
};

const EVOLUTION_NAMES = ['幼年体', '成长体', '成熟体', '完全体'];

const MOOD_MESSAGES: Record<string, string[]> = {
  happy: ['主人最好啦！', '今天好开心~', '想和主人一起玩！'],
  hungry: ['肚子咕咕叫...', '想吃好吃的...', '好饿呀...'],
  dirty: ['身上脏兮兮...', '想洗澡澡...'],
  tired: ['好困哦...', '想睡觉了...'],
  sick: ['咳咳...好难受...', '主人你终于来了...'],
  idle: ['主人去哪了？', '好无聊啊...'],
};

export default function PetPage() {
  const [pet, setPet] = useState<PetData | null>(null);
  const [shop, setShop] = useState<ShopItem[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [message, setMessage] = useState('');
  const [animating, setAnimating] = useState('');
  const { coins, setStats } = useUserStore();

  const loadPet = useCallback(async () => {
    try {
      const data = await getPet();
      setPet(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadShop = useCallback(async () => {
    try {
      const data = await getPetShop();
      setShop(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadPet();
    loadShop();
  }, []);

  const getMood = (): string => {
    if (!pet) return 'idle';
    const s = pet.stats;
    if (s.is_sick) return 'sick';
    if (s.hunger < 30) return 'hungry';
    if (s.cleanliness < 30) return 'dirty';
    if (s.energy < 30) return 'tired';
    if (s.hunger > 70 && s.happiness > 70 && s.cleanliness > 70) return 'happy';
    return 'idle';
  };

  const getRandomMessage = (mood: string): string => {
    const msgs = MOOD_MESSAGES[mood] || MOOD_MESSAGES.idle;
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const handleAction = async (action: string, apiFn: () => Promise<any>, cost: number) => {
    if (coins < cost) {
      setMessage('金币不够啦！去做题赚金币吧！');
      return;
    }
    setAnimating(action);
    try {
      const res = await apiFn();
      if (res.success) {
        setStats({ coins: res.coins_left });
        await loadPet();
        setMessage(getRandomMessage('happy'));
      } else {
        setMessage(res.message || '操作失败');
      }
    } catch (e) {
      setMessage('网络出错了...');
    }
    setTimeout(() => setAnimating(''), 800);
  };

  const handleBuy = async (item: ShopItem) => {
    if (coins < item.item_cost) {
      setMessage(`金币不够！需要 ${item.item_cost} 金币`);
      return;
    }
    try {
      const res = await buyPetItem(item.id);
      if (res.success) {
        setStats({ coins: res.coins_left });
        await loadShop();
        setMessage(`买了 ${res.item}！好可爱！`);
      } else {
        setMessage(res.message || '购买失败');
      }
    } catch (e) {
      setMessage('网络出错了...');
    }
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        加载中...
      </div>
    );
  }

  const mood = getMood();
  const petEmoji = SPECIES_EMOJI[pet.species] || '🐉';
  const barColor = (val: number) => val > 60 ? 'bg-green-500' : val > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <Link to="/" className="text-gray-400 mb-4 block">← 返回</Link>
      <h1 className="text-xl font-bold mb-4">🏠 宠物小屋</h1>

      {/* Pet Display */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-4 text-center">
        <div className={`text-7xl mb-2 transition-transform ${animating ? 'scale-125' : ''}`}>
          {petEmoji}
        </div>
        <div className="text-lg font-bold">{pet.pet_name}</div>
        <div className="text-sm text-gray-400">
          Lv.{pet.level} {EVOLUTION_NAMES[pet.evolution_stage - 1] || '未知'}
          {pet.stats.is_sick && <span className="text-red-400 ml-2">🤒 生病了</span>}
        </div>
      </div>

      {/* Pet Dialogue */}
      <div className="bg-gray-700 rounded-xl p-3 mb-4 text-center italic text-sm">
        💬 "{message || getRandomMessage(mood)}"
      </div>

      {/* Stats Bars */}
      <div className="space-y-2 mb-4">
        {[
          { label: '❤️ 饱腹', value: pet.stats.hunger },
          { label: '😊 快乐', value: pet.stats.happiness },
          { label: '⚡ 精力', value: pet.stats.energy },
          { label: '✨ 干净', value: pet.stats.cleanliness },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-16 text-sm">{s.label}</span>
            <div className="flex-1 h-3 bg-gray-600 rounded-full">
              <div
                className={`h-full rounded-full transition-all ${barColor(s.value)}`}
                style={{ width: `${s.value}%` }}
              />
            </div>
            <span className="text-xs w-8 text-right">{Math.round(s.value)}%</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleAction('feed', feedPet, 10)}
          disabled={animating === 'feed'}
          className="bg-orange-600 rounded-xl p-3 text-center text-sm disabled:opacity-50"
        >
          🍗<br />喂食<br /><span className="text-xs">-10🪙</span>
        </button>
        <button
          onClick={() => handleAction('play', playPet, 15)}
          disabled={animating === 'play'}
          className="bg-blue-600 rounded-xl p-3 text-center text-sm disabled:opacity-50"
        >
          🎾<br />陪玩<br /><span className="text-xs">-15🪙</span>
        </button>
        <button
          onClick={() => handleAction('clean', cleanPet, 5)}
          disabled={animating === 'clean'}
          className="bg-cyan-600 rounded-xl p-3 text-center text-sm disabled:opacity-50"
        >
          🛁<br />洗澡<br /><span className="text-xs">-5🪙</span>
        </button>
        <button
          onClick={() => handleAction('sleep', sleepPet, 0)}
          disabled={animating === 'sleep'}
          className="bg-purple-600 rounded-xl p-3 text-center text-sm"
        >
          💤<br />睡觉<br /><span className="text-xs">免费</span>
        </button>
      </div>

      {/* Coins Display */}
      <div className="text-center mb-4 text-yellow-400">🪙 {coins} 金币</div>

      {/* Shop Toggle */}
      <button
        onClick={() => setShowShop(!showShop)}
        className="w-full bg-gray-700 rounded-xl p-3 mb-4 text-center"
      >
        🏪 {showShop ? '关闭商店' : '打开商店'}
      </button>

      {/* Shop */}
      {showShop && (
        <div className="space-y-2">
          {shop.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold">{item.item_name}</div>
                <div className="text-xs text-gray-400">
                  {item.item_type === 'furniture' ? '🪑 家具' : item.item_type === 'decoration' ? '🎨 装饰' : '🎭 皮肤'}
                  {item.equipped && ' ✅ 已装备'}
                  {item.purchased && !item.equipped && ' ✅ 已拥有'}
                </div>
              </div>
              {!item.purchased ? (
                <button
                  onClick={() => handleBuy(item)}
                  className="bg-yellow-600 rounded-lg px-4 py-2 text-sm"
                >
                  购买 {item.item_cost}🪙
                </button>
              ) : (
                <span className="text-green-400 text-sm">已拥有</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
