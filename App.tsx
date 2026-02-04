import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  Home, 
  Users, 
  Award, 
  User, 
  PlusCircle, 
  Info, 
  ChevronRight, 
  Clock, 
  Camera,
  Save,
  Calendar,
  Search,
  Trophy
} from 'lucide-react';
import { CheckInRecord, UserStats, UserProfile } from './types';
import { formatDate, calculatePoints, isHoliday, checkWeeklyFullAttendance } from './utils';
import { POINT_RULES } from './constants';
import { getStudyEncouragement } from './services/geminiService';

// --- 模拟社区大数据 ---
const MOCK_COMMUNITY_USERS = [
  { name: '王思齐', points: 156.5, school: '清华大学', avatar: 'https://i.pravatar.cc/150?u=wang' },
  { name: '李明轩', points: 142.0, school: '复旦大学', avatar: 'https://i.pravatar.cc/150?u=li' },
  { name: '张小雅', points: 128.5, school: '浙江大学', avatar: 'https://i.pravatar.cc/150?u=zhang' },
  { name: '赵子涵', points: 98.0, school: '武汉大学', avatar: 'https://i.pravatar.cc/150?u=zhao' },
  { name: '陈美美', points: 45.5, school: '中山大学', avatar: 'https://i.pravatar.cc/150?u=chen' },
];

const MOCK_COMMUNITY_RECORDS: CheckInRecord[] = [
  {
    id: 'm1',
    userId: 'u2',
    userName: '王思齐',
    userAvatar: 'https://i.pravatar.cc/150?u=wang',
    date: '2025-02-04',
    content: '《机器学习》课程过半，今天推导了SVM的对偶问题，成就感满满！💻',
    images: ['https://picsum.photos/800/600?random=101'],
    studyHours: 6,
    points: 13.0
  },
  {
    id: 'm2',
    userId: 'u3',
    userName: '张小雅',
    userAvatar: 'https://i.pravatar.cc/150?u=zhang',
    date: '2025-02-04',
    content: '背了300个GRE单词，感觉脑细胞在燃烧。坚持就是胜利！🔥',
    images: ['https://picsum.photos/800/600?random=102'],
    studyHours: 4,
    points: 9.0
  }
];

// --- 布局组件 ---

const Header: React.FC = () => (
  <header className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-black italic">S</div>
      <div>
        <h1 className="text-base font-black text-gray-900 leading-tight">STUDY HUB</h1>
        <p className="text-[9px] text-indigo-500 font-bold tracking-tighter uppercase opacity-70">Winter Break 2025</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
       <button className="p-2 hover:bg-gray-50 rounded-full transition text-gray-400"><Search size={20} /></button>
    </div>
  </header>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 pt-3 pb-8 flex justify-between items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      <Link to="/" className={`flex flex-col items-center transition-all ${isActive('/') ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}>
        {/* Fix: Lucide icons do not support the 'variant' prop. Removed to fix TS error. */}
        <Home size={22} />
        <span className="text-[10px] mt-1.5 font-bold">概览</span>
      </Link>
      <Link to="/square" className={`flex flex-col items-center transition-all ${isActive('/square') ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}>
        <Users size={22} />
        <span className="text-[10px] mt-1.5 font-bold">广场</span>
      </Link>
      <div className="relative -mt-14">
        <Link to="/checkin" className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 border-4 border-white transform transition active:scale-90 rotate-45">
          <PlusCircle size={32} className="-rotate-45" />
        </Link>
      </div>
      <Link to="/ranking" className={`flex flex-col items-center transition-all ${isActive('/ranking') ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}>
        <Award size={22} />
        <span className="text-[10px] mt-1.5 font-bold">排行</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center transition-all ${isActive('/profile') ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}>
        <User size={22} />
        <span className="text-[10px] mt-1.5 font-bold">我的</span>
      </Link>
    </nav>
  );
};

// --- 页面内容 ---

const Dashboard: React.FC<{ stats: UserStats, profile: UserProfile }> = ({ stats, profile }) => {
  const [quote, setQuote] = useState("正在连接 AI 助教...");

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await getStudyEncouragement(`我是${profile.name}，正在${profile.school}学习。`, 0);
      setQuote(q);
    };
    fetchQuote();
  }, [profile]);

  return (
    <div className="p-5 space-y-6 pb-32 animate-in fade-in duration-700">
      {/* 头部资料 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={profile.avatar} className="w-14 h-14 rounded-2xl border-2 border-white shadow-xl object-cover" alt="User" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">早安，{profile.name}</h2>
            <p className="text-xs font-bold text-gray-400">{profile.school} · {profile.grade}</p>
          </div>
        </div>
        <Link to="/profile/edit" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400">
           <Save size={18} />
        </Link>
      </div>

      {/* 核心积分卡片 */}
      <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-indigo-100 text-xs font-bold tracking-widest uppercase opacity-80 mb-1">Current Points</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-black tracking-tighter">{stats.totalPoints.toFixed(1)}</h2>
              <span className="text-lg font-bold opacity-60">PTS</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
            <Trophy size={24} className="text-yellow-300" />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div className="space-y-1">
            <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-60">学习时数</p>
            <p className="text-lg font-black">{stats.totalStudyHours}<span className="text-xs font-normal ml-0.5 opacity-60">h</span></p>
          </div>
          <div className="space-y-1 border-x border-white/10 px-4">
            <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-60">打卡天数</p>
            <p className="text-lg font-black">{stats.checkInCount}<span className="text-xs font-normal ml-0.5 opacity-60">d</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-60">当前连胜</p>
            <p className="text-lg font-black">{stats.streak}<span className="text-xs font-normal ml-0.5 opacity-60">d</span></p>
          </div>
        </div>
      </div>

      {/* AI 点评 */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-indigo-600 font-black italic">AI</div>
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Assistant Feedback</h4>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">"{quote}"</p>
        </div>
      </div>

      {/* 快捷按钮 */}
      <div className="grid grid-cols-2 gap-4">
         <Link to="/checkin" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition group">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
               <PlusCircle size={28} />
            </div>
            <span className="text-sm font-black text-gray-800">开始打卡</span>
         </Link>
         <Link to="/ranking" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition group">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
               <Award size={28} />
            </div>
            <span className="text-sm font-black text-gray-800">社区排行</span>
         </Link>
      </div>
    </div>
  );
};

const SquarePage: React.FC<{ records: CheckInRecord[] }> = ({ records }) => {
  const allRecords = [...records, ...MOCK_COMMUNITY_RECORDS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-5 pb-32 space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">学习广场</h2>
        <div className="bg-indigo-100 text-indigo-600 text-[10px] px-3 py-1 rounded-lg font-black uppercase">Live Updates</div>
      </div>

      <div className="space-y-8">
        {allRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50 group">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img src={record.userAvatar} className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-50" alt="Avatar" />
                <div>
                  <h4 className="text-sm font-black text-gray-900">{record.userName}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{record.date} • {record.studyHours}H STUDY</p>
                </div>
              </div>
              <div className="bg-indigo-50 px-3 py-1 rounded-xl text-indigo-600 font-black text-xs">+{record.points.toFixed(1)}</div>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{record.content}</p>
              {record.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-lg shadow-gray-100">
                  <img src={record.images[0]} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" alt="Post content" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileEditPage: React.FC<{ profile: UserProfile, onUpdate: (p: UserProfile) => void }> = ({ profile, onUpdate }) => {
  const [edited, setEdited] = useState(profile);
  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEdited({ ...edited, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(edited);
    navigate('/profile');
  };

  return (
    <div className="p-6 space-y-10 pb-32">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img src={edited.avatar} className="w-32 h-32 rounded-[40px] border-4 border-white shadow-2xl object-cover" alt="Profile" />
          <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl cursor-pointer border-4 border-white shadow-lg active:scale-90 transition">
            <Camera size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">个性化资料</h2>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Update your public identity</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">用户昵称</label>
          <input 
            value={edited.name}
            onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            className="w-full p-5 bg-white border border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-gray-800 transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">所属大学</label>
          <input 
            value={edited.school}
            onChange={(e) => setEdited({ ...edited, school: e.target.value })}
            className="w-full p-5 bg-white border border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-gray-800 transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">就读年级</label>
          <input 
            value={edited.grade}
            onChange={(e) => setEdited({ ...edited, grade: e.target.value })}
            className="w-full p-5 bg-white border border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-gray-800 transition"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition"
      >
        <Save size={20} />
        更新并同步到社区
      </button>
    </div>
  );
};

const RankingPage: React.FC<{ stats: UserStats, profile: UserProfile }> = ({ stats, profile }) => {
  // Fix: Ensure all items in the ranking list have the 'isMe' property by mapping over mock users.
  const fullRankList = [
    { name: profile.name, points: stats.totalPoints, avatar: profile.avatar, school: profile.school, isMe: true },
    ...MOCK_COMMUNITY_USERS.map(user => ({ ...user, isMe: false }))
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="p-5 pb-32 space-y-8">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-3xl font-black text-gray-900">积分英雄榜</h2>
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Global Study Leaderboard</p>
      </div>

      <div className="bg-white rounded-[40px] p-4 shadow-sm border border-gray-50 space-y-2">
        {fullRankList.map((item, index) => (
          <div key={item.name + index} className={`flex items-center justify-between p-4 rounded-3xl transition-all duration-300 ${item.isMe ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -mx-1' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center italic">
                {index === 0 ? <Trophy size={20} className="text-yellow-400" /> : 
                 index === 1 ? <Trophy size={20} className="text-gray-400" /> : 
                 index === 2 ? <Trophy size={20} className="text-orange-400" /> : 
                 <span className={`text-sm font-black ${item.isMe ? 'text-white' : 'text-gray-300'}`}>{index + 1}</span>}
              </div>
              <img src={item.avatar} className={`w-12 h-12 rounded-2xl object-cover ${item.isMe ? 'ring-2 ring-white/30' : 'ring-2 ring-indigo-50'}`} alt="Avatar" />
              <div>
                <h4 className={`text-sm font-black ${item.isMe ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                <p className={`text-[10px] font-bold ${item.isMe ? 'text-white/60' : 'text-gray-400'}`}>{item.school}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black ${item.isMe ? 'text-white' : 'text-indigo-600'}`}>{item.points.toFixed(1)}</p>
              <p className={`text-[9px] font-bold uppercase ${item.isMe ? 'text-white/40' : 'text-gray-300'}`}>Points</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[40px] p-8 text-center text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <h3 className="text-2xl font-black mb-2 relative z-10">每周全勤奖励</h3>
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] relative z-10 mb-6">Weekly Streak Bonus</p>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl relative z-10 border border-white/10">
          <PlusCircle size={20} className="text-yellow-400" />
          <span className="text-xl font-black">+7.0 PTS</span>
        </div>
      </div>
    </div>
  );
};

// --- 主程序入口 ---

const App: React.FC = () => {
  const [records, setRecords] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem('study_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile_v2');
    return saved ? JSON.parse(saved) : {
      name: '未名学者',
      school: '北京大学',
      grade: '2024级',
      avatar: 'https://i.pravatar.cc/150?u=me'
    };
  });

  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    streak: 0,
    checkInCount: 0,
    totalStudyHours: 0
  });

  useEffect(() => {
    localStorage.setItem('study_records', JSON.stringify(records));
    localStorage.setItem('user_profile_v2', JSON.stringify(profile));
    
    let totalP = records.reduce((acc, curr) => acc + curr.points, 0);
    let totalH = records.reduce((acc, curr) => acc + curr.studyHours, 0);
    
    const today = new Date();
    if (checkWeeklyFullAttendance(records, today)) {
       totalP += POINT_RULES.WEEKLY_BONUS;
    }

    let currentStreak = 0;
    const sortedDates = [...new Set(records.map(r => r.date))].sort().reverse();
    const todayStr = formatDate(new Date());
    
    if (sortedDates[0] === todayStr || sortedDates[0] === formatDate(new Date(Date.now() - 86400000))) {
       currentStreak = 1;
       for (let i = 0; i < sortedDates.length - 1; i++) {
         const d1 = new Date(sortedDates[i]);
         const d2 = new Date(sortedDates[i+1]);
         if ((d1.getTime() - d2.getTime()) === 86400000) {
           currentStreak++;
         } else {
           break;
         }
       }
    }

    setStats({
      totalPoints: totalP,
      totalStudyHours: totalH,
      checkInCount: records.length,
      streak: currentStreak
    });
  }, [records, profile]);

  const handleAddRecord = (newRecord: CheckInRecord) => {
    setRecords(prev => [...prev, newRecord]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex justify-center overflow-x-hidden">
        <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl border-x border-gray-100">
          <Header />
          <main className="pb-32">
            <Routes>
              <Route path="/" element={<Dashboard stats={stats} profile={profile} />} />
              <Route path="/square" element={<SquarePage records={records} />} />
              <Route path="/checkin" element={<CheckInPageWrapper profile={profile} onAddRecord={handleAddRecord} />} />
              <Route path="/ranking" element={<RankingPage stats={stats} profile={profile} />} />
              <Route path="/profile" element={<ProfilePageWrapper profile={profile} />} />
              <Route path="/profile/edit" element={<ProfileEditPage profile={profile} onUpdate={setProfile} />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </div>
    </Router>
  );
};

// 包装组件以简化主 App 逻辑
const CheckInPageWrapper: React.FC<{ profile: UserProfile, onAddRecord: (r: CheckInRecord) => void }> = ({ profile, onAddRecord }) => {
  // 这里可以复用之前的 CheckInPage 逻辑，但确保 it 使用最新的 profile
  // 为了篇幅，我们直接在此快速重写精简版逻辑，包含发布后的跳转
  const [content, setContent] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    const points = calculatePoints(hours);
    onAddRecord({
      id: Date.now().toString(),
      userId: 'me',
      userName: profile.name,
      userAvatar: profile.avatar,
      date: formatDate(new Date()),
      content,
      images: images.length > 0 ? images : ['https://picsum.photos/800/600?random=' + Date.now()],
      studyHours: hours,
      points
    });
    setSubmitting(false);
    navigate('/square');
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <h2 className="text-3xl font-black text-gray-900">发布动态</h2>
      <textarea 
        className="w-full p-6 bg-gray-50 border-none rounded-[32px] h-48 focus:ring-4 focus:ring-indigo-100 outline-none font-medium" 
        placeholder="今天学到了什么？"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">学习时长 (小时)</label>
        <input 
          type="number" 
          step="0.5" 
          value={hours}
          onChange={e => setHours(parseFloat(e.target.value))}
          className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-800"
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black shadow-2xl shadow-indigo-100"
      >
        {submitting ? '同步中...' : '发布并同步到广场'}
      </button>
    </div>
  );
};

const ProfilePageWrapper: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="pb-32">
    <div className="bg-indigo-600 p-12 text-center rounded-b-[60px] shadow-2xl shadow-indigo-100 mb-10">
      <img src={profile.avatar} className="w-28 h-28 rounded-[40px] border-4 border-white shadow-2xl mx-auto mb-6 object-cover" alt="Me" />
      <h2 className="text-2xl font-black text-white">{profile.name}</h2>
      <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mt-1 opacity-80">{profile.school} • {profile.grade}</p>
    </div>
    <div className="px-6 space-y-4">
      <Link to="/profile/edit" className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-50 shadow-sm active:bg-gray-50 transition">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><User size={22} /></div>
          <span className="font-black text-gray-800">编辑个人资料</span>
        </div>
        <ChevronRight size={20} className="text-gray-300" />
      </Link>
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-50 shadow-sm opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><Calendar size={22} /></div>
          <span className="font-black text-gray-800">补签申请</span>
        </div>
        <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-lg">限前一日</span>
      </div>
    </div>
  </div>
);

export default App;