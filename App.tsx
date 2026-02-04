
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
  Image as ImageIcon,
  AlertCircle,
  Camera,
  Save,
  // Fix: Added missing Calendar import from lucide-react
  Calendar
} from 'lucide-react';
import { CheckInRecord, UserStats, UserProfile } from './types';
import { formatDate, calculatePoints, isHoliday, checkWeeklyFullAttendance } from './utils';
import { POINT_RULES } from './constants';
import { getStudyEncouragement } from './services/geminiService';

// --- Mock Data for Community ---
const MOCK_COMMUNITY_RECORDS: CheckInRecord[] = [
  {
    id: 'm1',
    userId: 'u2',
    userName: '张同学',
    userAvatar: 'https://picsum.photos/100/100?random=21',
    date: '2025-02-04',
    content: '今天完成了高等数学第三章的复习，感觉逻辑通顺了很多。坚持就是胜利！',
    images: ['https://picsum.photos/400/300?random=31'],
    studyHours: 3.5,
    points: 8.0
  },
  {
    id: 'm2',
    userId: 'u3',
    userName: '李思思',
    userAvatar: 'https://picsum.photos/100/100?random=22',
    date: '2025-02-04',
    content: '背了200个考研单词，打卡！希望寒假结束能把红宝书过完一遍。',
    images: ['https://picsum.photos/400/300?random=32'],
    studyHours: 2,
    points: 5.0
  }
];

// --- Components ---

const Header: React.FC = () => (
  <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">冬</div>
      <h1 className="text-lg font-bold text-gray-800 tracking-tight">寒假学习打卡</h1>
    </div>
    <div className="flex items-center gap-3">
       <button className="text-gray-400"><Info size={20} /></button>
    </div>
  </header>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-30 safe-area-inset-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">首页</span>
      </Link>
      <Link to="/square" className={`flex flex-col items-center ${isActive('/square') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Users size={24} />
        <span className="text-[10px] mt-1 font-medium">广场</span>
      </Link>
      <div className="relative -mt-10">
        <Link to="/checkin" className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transform transition active:scale-90">
          <PlusCircle size={28} />
        </Link>
      </div>
      <Link to="/ranking" className={`flex flex-col items-center ${isActive('/ranking') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Award size={24} />
        <span className="text-[10px] mt-1 font-medium">排行</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <User size={24} />
        <span className="text-[10px] mt-1 font-medium">我的</span>
      </Link>
    </nav>
  );
};

// --- Pages ---

const Dashboard: React.FC<{ stats: UserStats, profile: UserProfile }> = ({ stats, profile }) => {
  const [quote, setQuote] = useState("正在生成今日学习灵感...");

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await getStudyEncouragement(`我是${profile.name}，正在${profile.school}读${profile.grade}，开启打卡`, 0);
      setQuote(q);
    };
    fetchQuote();
  }, [profile]);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* User Welcome */}
      <div className="flex items-center gap-3">
        <img src={profile.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">你好，{profile.name}</h2>
          <p className="text-xs text-gray-400">{profile.school} · {profile.grade}</p>
        </div>
      </div>

      {/* User Points Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium">当前累计积分</p>
          <div className="flex items-end gap-2 mt-1">
            <h2 className="text-5xl font-bold tracking-tight">{stats.totalPoints.toFixed(1)}</h2>
            <span className="text-lg mb-1 opacity-80">pts</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-8 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] opacity-80">累计打卡</p>
              <p className="text-md font-bold">{stats.checkInCount}d</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-indigo-100 text-[10px] opacity-80">学习时长</p>
              <p className="text-md font-bold">{stats.totalStudyHours}h</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-100 text-[10px] opacity-80">连胜纪录</p>
              <p className="text-md font-bold">{stats.streak}d</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Quote */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-start">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex-shrink-0 flex items-center justify-center text-indigo-500">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">AI 助教点评</h4>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{quote}"</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/checkin" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition">
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
             <PlusCircle size={26} />
           </div>
           <span className="text-sm font-bold text-gray-700">立即打卡</span>
        </Link>
        <Link to="/ranking" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
             <Award size={26} />
           </div>
           <span className="text-sm font-bold text-gray-700">查看排行</span>
        </Link>
      </div>
    </div>
  );
};

const SquarePage: React.FC<{ records: CheckInRecord[] }> = ({ records }) => {
  const allRecords = [...records, ...MOCK_COMMUNITY_RECORDS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-gray-800">学习广场</h2>
        <div className="flex gap-2">
          <span className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-bold">全员可见</span>
        </div>
      </div>

      {allRecords.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Users size={48} className="opacity-20 mb-4" />
          <p>广场空空如也，快来发布第一条打卡吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {allRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <img src={record.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="User" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{record.userName}</h4>
                    <p className="text-[10px] text-gray-400">{record.date} · 学习 {record.studyHours}h</p>
                  </div>
                </div>
                <div className="text-indigo-600 font-black text-sm">+{record.points.toFixed(1)}</div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                {record.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden">
                    <img src={record.images[0]} className="w-full aspect-[4/3] object-cover" alt="Checkin" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CheckInPage: React.FC<{ profile: UserProfile, onAddRecord: (r: CheckInRecord) => void }> = ({ profile, onAddRecord }) => {
  const [content, setContent] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const today = new Date();
  const isSuspended = isHoliday(today);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return alert("请输入学习内容");
    if (hours < 0 || hours > 24) return alert("时长输入不合法");
    
    setSubmitting(true);
    const points = calculatePoints(hours);
    
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      userId: 'user_me',
      userName: profile.name,
      userAvatar: profile.avatar,
      date: formatDate(today),
      content,
      images,
      studyHours: hours,
      points,
    };

    const aiFeedback = await getStudyEncouragement(content, hours);
    setFeedback(aiFeedback);
    onAddRecord(newRecord);
    setSubmitting(false);
  };

  if (isSuspended) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <Clock size={40} />
        </div>
        <h2 className="text-xl font-bold">春节暂停安排</h2>
        <p className="text-gray-500 text-sm">2月16日至2月22日期间暂停打卡安排。祝你新春快乐！</p>
        <Link to="/" className="text-indigo-600 font-medium">返回首页</Link>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 animate-in zoom-in duration-300">
         <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-100">
            <PlusCircle size={48} />
         </div>
         <div>
           <h2 className="text-2xl font-black text-gray-800">打卡成功！</h2>
           <p className="text-indigo-600 font-black text-xl mt-1">积分奖励 +{calculatePoints(hours).toFixed(1)}</p>
         </div>
         <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-indigo-100 text-[10px] font-bold text-indigo-500">AI 打卡点评</div>
            <p className="text-gray-700 italic text-sm leading-relaxed">"{feedback}"</p>
         </div>
         <Link to="/square" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200">去广场看看大家</Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-xl font-black text-gray-800">发布今日打卡</h2>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">学习内容摘要</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition text-sm leading-relaxed"
            placeholder="今天学到了哪些知识点？有什么感悟？"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">时长 (h)</label>
            <input 
              type="number"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">图片资料</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-400">
                <Camera size={20} />
                <span className="text-xs font-bold">{images.length > 0 ? '已选' : '拍摄'}</span>
              </div>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-gray-100">
            <img src={images[0]} className="w-full h-48 object-cover" alt="Preview" />
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          {submitting ? '同步至广场中...' : '提交打卡并同步广场'}
        </button>
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
    <div className="p-6 space-y-8 pb-24">
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <img src={edited.avatar} className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover" alt="Profile" />
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer border-4 border-white shadow-lg">
            <Camera size={16} />
            <input type="file" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">编辑个人账号</h2>
          <p className="text-xs text-gray-400">信息将在打卡记录和排行榜中显示</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">姓名 / 昵称</label>
          <input 
            value={edited.name}
            onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">所属学校</label>
          <input 
            value={edited.school}
            onChange={(e) => setEdited({ ...edited, school: e.target.value })}
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">年级</label>
          <input 
            value={edited.grade}
            onChange={(e) => setEdited({ ...edited, grade: e.target.value })}
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition"
      >
        <Save size={20} />
        保存修改
      </button>
    </div>
  );
};

const ProfilePage: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="pb-24">
      <div className="bg-white p-8 flex flex-col items-center border-b border-gray-50 mb-6">
        <img src={profile.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 mb-4 shadow-xl object-cover" alt="Avatar" />
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{profile.school} · {profile.grade}</p>
      </div>

      <div className="px-6 space-y-3">
        <Link to="/profile/edit" className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-50 active:bg-gray-50 transition shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><User size={20} /></div>
            <span className="text-sm font-bold text-gray-700">个人资料</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>
        <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-50 active:bg-gray-50 transition shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><Award size={20} /></div>
            <span className="text-sm font-bold text-gray-700">积分详情</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </div>
        <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-50 active:bg-gray-50 transition shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
            <span className="text-sm font-bold text-gray-700">补签申请</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">限前一日</span>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        </div>
      </div>

      <div className="mt-12 px-10 text-center">
        <p className="text-xs text-gray-300 leading-relaxed">如有疑问请联系学生发展中心工作人员</p>
        <p className="text-[10px] text-gray-200 mt-2 font-bold tracking-widest uppercase">Version 1.1.0 · Public Beta</p>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [records, setRecords] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem('study_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      name: '未名学者',
      school: '北京大学',
      grade: '2024级',
      avatar: 'https://picsum.photos/200/200?random=10'
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
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
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
      <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto bg-gray-50 border-x border-gray-100 shadow-2xl relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} profile={profile} />} />
            <Route path="/checkin" element={<CheckInPage profile={profile} onAddRecord={handleAddRecord} />} />
            <Route path="/square" element={<SquarePage records={records} />} />
            <Route path="/ranking" element={<RankingPage stats={stats} />} />
            <Route path="/profile" element={<ProfilePage profile={profile} />} />
            <Route path="/profile/edit" element={<ProfileEditPage profile={profile} onUpdate={setProfile} />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
};

// Reuse RankingPage logic with small avatar enhancement
const RankingPage: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const rankList = [
    { name: '我', points: stats.totalPoints, avatar: 'https://picsum.photos/100/100?random=10', isMe: true },
    { name: '王同学', points: 45.5, avatar: 'https://picsum.photos/100/100?random=21' },
    { name: '李思思', points: 38.2, avatar: 'https://picsum.photos/100/100?random=22' },
    { name: '赵大卫', points: 35.1, avatar: 'https://picsum.photos/100/100?random=23' },
    { name: '陈果', points: 28.4, avatar: 'https://picsum.photos/100/100?random=24' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-black mb-6">积分英雄榜</h2>
        <div className="space-y-4">
          {rankList.map((item, index) => (
            <div key={item.name} className={`flex items-center justify-between p-4 rounded-2xl transition ${item.isMe ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-6 text-center font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                  {index + 1}
                </span>
                <img src={item.avatar} className="w-11 h-11 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
                <span className={`text-sm font-bold ${item.isMe ? 'text-indigo-600' : 'text-gray-700'}`}>{item.name}</span>
              </div>
              <span className="text-sm font-black text-gray-800">{item.points.toFixed(1)} <span className="text-[10px] opacity-40">pts</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-indigo-100">
        <p className="text-xs text-indigo-100 mb-1 font-bold tracking-widest uppercase">Weekly Goal</p>
        <h3 className="text-2xl font-black">全勤额外 +7.0 分</h3>
        <p className="text-[10px] opacity-60 mt-4 leading-relaxed">每一个努力的清晨和深夜<br/>都在缩短你与梦想的距离</p>
      </div>
    </div>
  );
};

export default App;
