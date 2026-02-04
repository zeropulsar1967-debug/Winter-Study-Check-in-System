
import React, { useState, useEffect } from 'react';
// Use BrowserRouter as it is the most standard router in react-router-dom v6
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Award, 
  User, 
  PlusCircle, 
  Info, 
  ChevronRight, 
  Clock, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { CheckInRecord, UserStats } from './types';
import { formatDate, calculatePoints, isHoliday, checkWeeklyFullAttendance } from './utils';
import { POINT_RULES } from './constants';
import { getStudyEncouragement } from './services/geminiService';

// --- Components ---

const Header: React.FC = () => (
  <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-10 safe-area-inset-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">首页</span>
      </Link>
      <Link to="/history" className={`flex flex-col items-center ${isActive('/history') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Calendar size={24} />
        <span className="text-[10px] mt-1 font-medium">历程</span>
      </Link>
      <div className="relative -mt-10">
        <Link to="/checkin" className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transform transition active:scale-90">
          <PlusCircle size={28} />
        </Link>
      </div>
      <Link to="/ranking" className={`flex flex-col items-center ${isActive('/ranking') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <Award size={24} />
        <span className="text-[10px] mt-1 font-medium">积分</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-400'}`}>
        <User size={24} />
        <span className="text-[10px] mt-1 font-medium">我的</span>
      </Link>
    </nav>
  );
};

// --- Pages ---

const Dashboard: React.FC<{ stats: UserStats, records: CheckInRecord[] }> = ({ stats, records }) => {
  const [quote, setQuote] = useState("正在生成今日学习灵感...");

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await getStudyEncouragement("寒假第一天，开启学习计划", 0);
      setQuote(q);
    };
    fetchQuote();
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* User Points Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium">当前总积分</p>
          <div className="flex items-end gap-2 mt-1">
            <h2 className="text-4xl font-bold">{stats.totalPoints.toFixed(1)}</h2>
            <span className="text-lg mb-1 opacity-80">分</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-indigo-100 text-xs">累计打卡</p>
              <p className="text-lg font-bold">{stats.checkInCount}天</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">学习时长</p>
              <p className="text-lg font-bold">{stats.totalStudyHours}h</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">当前连胜</p>
              <p className="text-lg font-bold">{stats.streak}天</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Quote */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start">
        <div className="w-10 h-10 bg-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-500">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">今日鼓励</h4>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{quote}"</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
             <Clock size={24} />
           </div>
           <span className="text-sm font-semibold">计时学习</span>
        </div>
        <Link to="/checkin" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
             <PlusCircle size={24} />
           </div>
           <span className="text-sm font-semibold">发布打卡</span>
        </Link>
      </div>

      {/* Rules Notice */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
           <AlertCircle size={18} />
           <h3 className="font-bold text-sm">积分小贴士</h3>
        </div>
        <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-4">
          <li>基础分：每次打卡获得1.0分。</li>
          <li>时长分：每学习0.5小时加1.0分。</li>
          <li>上限：每日积分上限为17.0分（约8小时）。</li>
          <li>奖励：每周全勤额外奖励7.0分。</li>
        </ul>
      </div>
    </div>
  );
};

const CheckInPage: React.FC<{ onAddRecord: (r: CheckInRecord) => void }> = ({ onAddRecord }) => {
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
      date: formatDate(today),
      content,
      images,
      studyHours: hours,
      points,
    };

    // AI feedback
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 animate-in fade-in duration-500">
         <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-2">
            <PlusCircle size={48} />
         </div>
         <div>
           <h2 className="text-2xl font-bold text-gray-800">打卡成功！</h2>
           <p className="text-indigo-600 font-bold text-lg mt-1">积分 +{calculatePoints(hours).toFixed(1)}</p>
         </div>
         <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <p className="text-gray-700 italic text-sm leading-relaxed">"{feedback}"</p>
         </div>
         <Link to="/" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">发布今日打卡</h2>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">学习内容摘要</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
            placeholder="今天学习了什么？分享一下你的收获吧..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">学习时长 (小时)</label>
            <input 
              type="number"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">图片资料</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-gray-400">
                <ImageIcon size={20} />
                <span className="text-sm font-medium">{images.length > 0 ? '已上传' : '点击上传'}</span>
              </div>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, i) => (
              <img key={i} src={img} className="rounded-lg w-full h-32 object-cover border border-gray-200" alt="Preview" />
            ))}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          {submitting ? '提交中...' : '立即打卡'}
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-400 px-2">
        <AlertCircle size={16} />
        <p className="text-xs">如需补签前一日，请及时联系学生发展中心工作人员协助处理。</p>
      </div>
    </div>
  );
};

const HistoryPage: React.FC<{ records: CheckInRecord[] }> = ({ records }) => {
  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">学习历程</h2>
        <span className="text-xs text-gray-400">共 {records.length} 条记录</span>
      </div>

      {records.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Calendar size={48} className="opacity-20 mb-4" />
          <p>暂无打卡记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.slice().reverse().map((record) => (
            <div key={record.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-bold">
                    {record.date.split('-')[2]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{record.date}</h4>
                    <p className="text-[10px] text-gray-400">学习时长: {record.studyHours}h</p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  +{record.points.toFixed(1)} 分
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{record.content}</p>
              {record.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {record.images.map((img, i) => (
                    <img key={i} src={img} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" alt="Work" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RankingPage: React.FC<{ stats: UserStats }> = ({ stats }) => {
  // Mocking top students for visualization
  const rankList = [
    { name: '我', points: stats.totalPoints, avatar: 'https://picsum.photos/50/50?random=1', isMe: true },
    { name: '王同学', points: stats.totalPoints + 12.5, avatar: 'https://picsum.photos/50/50?random=2' },
    { name: '李同学', points: stats.totalPoints + 8.2, avatar: 'https://picsum.photos/50/50?random=3' },
    { name: '赵同学', points: stats.totalPoints + 5.1, avatar: 'https://picsum.photos/50/50?random=4' },
    { name: '陈同学', points: stats.totalPoints - 3.4, avatar: 'https://picsum.photos/50/50?random=5' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">学霸排行榜</h2>
        <div className="space-y-4">
          {rankList.map((item, index) => (
            <div key={item.name} className={`flex items-center justify-between p-3 rounded-xl ${item.isMe ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                  {index + 1}
                </span>
                <img src={item.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt="Avatar" />
                <span className={`text-sm font-medium ${item.isMe ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>{item.name}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{item.points.toFixed(1)} 分</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center">
        <p className="text-xs text-indigo-100 mb-1 font-medium">加油！本周全勤可额外获得</p>
        <h3 className="text-2xl font-bold">+7.0 奖励分</h3>
        <p className="text-[10px] opacity-70 mt-4">积分仅用于寒假成长记录与学生发展评价</p>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const menuItems = [
    { label: '个人资料', icon: <User size={18} /> },
    { label: '积分详情', icon: <Award size={18} /> },
    { label: '成就勋章', icon: <PlusCircle size={18} /> },
    { label: '补签申请', icon: <Calendar size={18} />, sub: '限前一日' },
  ];

  return (
    <div className="pb-24">
      <div className="bg-white p-6 flex flex-col items-center border-b border-gray-100 mb-4">
        <img src="https://picsum.photos/100/100?random=10" className="w-24 h-24 rounded-full border-4 border-indigo-50 mb-4 shadow-sm" alt="Avatar" />
        <h2 className="text-xl font-bold text-gray-800">未名学者</h2>
        <p className="text-sm text-gray-400">北京大学 · 2024级</p>
      </div>

      <div className="px-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label} className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-50 active:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="text-indigo-500">{item.icon}</div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.sub && <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">{item.sub}</span>}
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 px-6 text-center">
        <p className="text-xs text-gray-400">如有疑问请联系学生发展中心工作人员</p>
        <p className="text-[10px] text-gray-300 mt-1">版本 v1.0.2 · 寒假版</p>
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

  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    streak: 0,
    checkInCount: 0,
    totalStudyHours: 0
  });

  useEffect(() => {
    localStorage.setItem('study_records', JSON.stringify(records));
    
    // Calculate Stats
    let totalP = records.reduce((acc, curr) => acc + curr.points, 0);
    let totalH = records.reduce((acc, curr) => acc + curr.studyHours, 0);
    
    // Check weekly bonuses
    const today = new Date();
    if (checkWeeklyFullAttendance(records, today)) {
       totalP += POINT_RULES.WEEKLY_BONUS;
    }

    // Simple streak calc
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
  }, [records]);

  const handleAddRecord = (newRecord: CheckInRecord) => {
    setRecords(prev => [...prev, newRecord]);
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto bg-gray-50 border-x border-gray-100 shadow-xl relative">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} records={records} />} />
            <Route path="/checkin" element={<CheckInPage onAddRecord={handleAddRecord} />} />
            <Route path="/history" element={<HistoryPage records={records} />} />
            <Route path="/ranking" element={<RankingPage stats={stats} />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
};

export default App;
