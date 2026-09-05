import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Calendar, DollarSign, Users, CheckSquare, Clock, Utensils,
  FileText, Sparkles, Settings, Plus, Trash2, CheckCircle2, Circle,
  Phone, ShieldCheck, Mail, Menu, X, Download, Moon, Sun
} from 'lucide-react';

interface Task { id: string; title: string; assignee: string; dueDate: string; status: 'Chưa làm' | 'Hoàn thành'; }
interface Expense { id: string; category: string; estimated: number; spent: number; notes: string; }
interface Guest { id: string; name: string; phone: string; side: 'Cô dâu' | 'Chú rể'; pax: number; rsvp: 'Chưa trả lời' | 'Tham dự' | 'Không tham dự'; table: string; }
interface Vendor { id: string; category: string; name: string; phone: string; price: number; deposit: number; }
interface TimelineItem { id: string; time: string; title: string; desc: string; }
interface TableItem { id: string; name: string; capacity: number; }
interface NoteItem { id: string; title: string; content: string; }

const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const bom = '\uFEFF';
  const csvContent = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('wedding_dark_mode') || 'false'); } catch { return false; }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [wedding, setWedding] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_info') || JSON.stringify({
        brideName: 'Thu Trang',
        groomName: 'Hoàng Long',
        weddingDate: '2026-10-25',
        totalBudget: 150000000,
        totalGuestsTarget: 300
      }));
    } catch {
      return { brideName: 'Thu Trang', groomName: 'Hoàng Long', weddingDate: '2026-10-25', totalBudget: 150000000, totalGuestsTarget: 300 };
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_tasks') || JSON.stringify([
        { id: '1', title: 'Đặt cọc sảnh tiệc & chốt thực đơn', assignee: 'Cả hai', dueDate: '2026-09-15', status: 'Hoàn thành' },
        { id: '2', title: 'Thử váy cưới và phụ kiện', assignee: 'Cô dâu', dueDate: '2026-09-20', status: 'Chưa làm' },
        { id: '3', title: 'May vest chú rể', assignee: 'Chú rể', dueDate: '2026-09-25', status: 'Chưa làm' }
      ]));
    } catch { return []; }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_expenses') || JSON.stringify([
        { id: '1', category: 'Nhà hàng tiệc cưới', estimated: 85000000, spent: 40000000, notes: 'Đã cọc đợt 1' },
        { id: '2', category: 'Trang phục & Makeup', estimated: 20000000, spent: 10000000, notes: 'Váy cưới + vest' },
        { id: '3', category: 'Quay chụp phóng sự', estimated: 15000000, spent: 5000000, notes: 'Ekip 2 máy' }
      ]));
    } catch { return []; }
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_guests') || JSON.stringify([
        { id: '1', name: 'Nguyễn Văn Hải (Bác Hai)', phone: '0908112233', side: 'Cô dâu', pax: 2, rsvp: 'Tham dự', table: 'Bàn 01' },
        { id: '2', name: 'Trần Quốc Tuấn', phone: '0938334455', side: 'Chú rể', pax: 2, rsvp: 'Tham dự', table: 'Bàn 02' },
        { id: '3', name: 'Vũ Hoàng Nam', phone: '0988556677', side: 'Chú rể', pax: 1, rsvp: 'Chưa trả lời', table: 'Chưa xếp' }
      ]));
    } catch { return []; }
  });

  const [vendors] = useState<Vendor[]>([
    { id: '1', category: 'Nhà hàng', name: 'White Palace', phone: '02838447266', price: 85000000, deposit: 40000000 },
    { id: '2', category: 'Photographer', name: 'Muse Studio', phone: '0909123456', price: 15000000, deposit: 5000000 }
  ]);

  const [timeline] = useState<TimelineItem[]>([
    { id: '1', time: '07:00', title: 'Makeup Cô dâu & Mẹ', desc: 'Chuyên viên make up tại nhà gái' },
    { id: '2', time: '09:00', title: 'Lễ Gia Tiên', desc: 'Trao nhẫn và làm lễ trước bàn thờ gia tiên' },
    { id: '3', time: '11:30', title: 'Tiệc Cưới Chính Thức', desc: 'Đón khách, cắt bánh và khai tiệc' }
  ]);

  const [tables] = useState<TableItem[]>([
    { id: '1', name: 'Bàn 01 - VIP Nhà Gái', capacity: 10 },
    { id: '2', name: 'Bàn 02 - VIP Nhà Trai', capacity: 10 }
  ]);

  const [notes] = useState<NoteItem[]>([
    { id: '1', title: 'Danh sách bài hát lễ đường', content: 'Until I Found You, Can\'t Help Falling in Love' },
    { id: '2', title: 'Mâm quả gia tiên', content: '6 tráp: Trầu cau, trà rượu, bánh phu thê, xôi gấc, heo quay, trái cây' }
  ]);

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestSide, setNewGuestSide] = useState<'Cô dâu' | 'Chú rể'>('Cô dâu');
  const [newGuestPax, setNewGuestPax] = useState('1');
  const [newExpenseCat, setNewExpenseCat] = useState('Nhà hàng');
  const [newExpenseEst, setNewExpenseEst] = useState('');
  const [newExpenseSpent, setNewExpenseSpent] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('wedding_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('wedding_info', JSON.stringify(wedding));
    localStorage.setItem('wedding_tasks', JSON.stringify(tasks));
    localStorage.setItem('wedding_expenses', JSON.stringify(expenses));
    localStorage.setItem('wedding_guests', JSON.stringify(guests));
  }, [wedding, tasks, expenses, guests]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + (Number(e.spent) || 0), 0), [expenses]);
  const remainingBudget = wedding.totalBudget - totalSpent;
  const daysRemaining = useMemo(() => {
    const diff = new Date(wedding.weddingDate).getTime() - new Date().setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [wedding.weddingDate]);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Sparkles },
    { id: 'checklist', label: 'Việc cần làm', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'Hoàn thành').length || undefined },
    { id: 'budget', label: 'Ngân sách', icon: DollarSign },
    { id: 'guests', label: 'Khách mời', icon: Users, badge: guests.length },
    { id: 'vendors', label: 'Nhà cung cấp', icon: Phone },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'seating', label: 'Sơ đồ bàn', icon: Utensils },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'admin', label: 'Quản trị viên', icon: ShieldCheck }
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#1A1614] text-[#E8E3DF]' : 'bg-[#FAF7F2] text-[#4A3B32]'}`}>
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#3E3028] dark:bg-[#E8E3DF] text-white dark:text-[#1A1614] text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D47365]" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r transition-all duration-300 shrink-0 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'} ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D47365]/15 text-[#D47365] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-sm truncate">Sổ Tay Cưới</h2>
                <span className="text-[10px] text-gray-500 block truncate">Kế hoạch hoàn hảo</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-xl text-gray-400 hover:text-[#D47365] cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active ? 'bg-[#D47365] text-white shadow-xs' : 'text-gray-400 hover:bg-[#D47365]/10 hover:text-[#D47365]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-[#D47365]/20 text-[#D47365]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative pb-16 md:pb-0">
        <header className={`px-6 py-3.5 border-b flex justify-between items-center backdrop-blur-xs ${isDarkMode ? 'bg-[#241F1C]/90 border-[#382E29]' : 'bg-white/90 border-[#ECDCCF]'}`}>
          <div className="flex items-center gap-2 text-xs font-medium min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold truncate">{wedding.brideName}</span>
            <span>❤️</span>
            <span className="font-bold truncate">{wedding.groomName}</span>
            <span className="hidden sm:inline text-gray-400">• Còn {daysRemaining} ngày</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border border-inherit text-gray-500 hover:text-[#D47365] cursor-pointer transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-gradient-to-r from-[#FBF3EE] to-[#F5E6DF] border-[#ECDCCF]'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-[#D47365] bg-[#D47365]/10 px-3 py-1 rounded-full">Lễ Thành Hôn</span>
                    <h1 className="text-3xl sm:text-4xl font-bold mt-2">{wedding.brideName} ❤️ {wedding.groomName}</h1>
                    <p className="text-xs text-gray-500 mt-1">{wedding.weddingDate} • {wedding.totalGuestsTarget} khách mời dự kiến</p>
                  </div>
                  <div className={`px-5 py-3 rounded-2xl border text-center ${isDarkMode ? 'bg-[#1A1614] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <span className="text-3xl font-bold text-[#D47365] block">{daysRemaining}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Ngày đếm ngược</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ngân Sách', val: `${(wedding.totalBudget / 1e6).toFixed(0)} tr`, sub: 'Tổng hạn mức' },
                  { label: 'Đã Chi', val: `${(totalSpent / 1e6).toFixed(0)} tr`, sub: `Chiếm ${Math.round((totalSpent / wedding.totalBudget) * 100)}%` },
                  { label: 'Số Dư', val: `${(remainingBudget / 1e6).toFixed(0)} tr`, sub: 'Khả dụng' },
                  { label: 'Khách Mời', val: `${guests.length} người`, sub: 'Đã lên danh sách' }
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <span className="text-xs text-gray-400 font-semibold">{s.label}</span>
                    <p className="text-xl font-bold mt-1">{s.val}</p>
                    <span className="text-[11px] text-gray-400">{s.sub}</span>
                  </div>
                ))}
              </div>

              <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#D47365]" /> Việc Cần Làm Hôm Nay
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!quickTaskTitle.trim()) return;
                  setTasks([{ id: Date.now().toString(), title: quickTaskTitle.trim(), assignee: 'Cả hai', dueDate: wedding.weddingDate, status: 'Chưa làm' }, ...tasks]);
                  setQuickTaskTitle('');
                  notify('Đã thêm công việc!');
                }} className="flex gap-2">
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={e => setQuickTaskTitle(e.target.value)}
                    placeholder="Thêm nhanh việc... (VD: Đặt xe hoa)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-inherit text-xs outline-none bg-transparent"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#D47365] text-white text-xs font-semibold rounded-xl hover:bg-[#c26254] cursor-pointer">
                    Thêm
                  </button>
                </form>

                <div className="divide-y divide-inherit">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'Hoàn thành' ? 'Chưa làm' : 'Hoàn thành' } : t));
                      }}>
                        {task.status === 'Hoàn thành' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                        <span className={`text-xs ${task.status === 'Hoàn thành' ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{task.assignee}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Danh Sách Việc Cần Làm</h2>
              <div className={`rounded-2xl border divide-y ${isDarkMode ? 'bg-[#241F1C] border-[#382E29] divide-[#382E29]' : 'bg-white border-[#ECDCCF] divide-gray-100'}`}>
                {tasks.map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                      setTasks(tasks.map(x => x.id === t.id ? { ...x, status: x.status === 'Hoàn thành' ? 'Chưa làm' : 'Hoàn thành' } : x));
                    }}>
                      {t.status === 'Hoàn thành' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
                      <div>
                        <p className={`text-xs font-bold ${t.status === 'Hoàn thành' ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                        <span className="text-[10px] text-gray-400">{t.assignee} • Hạn: {t.dueDate}</span>
                      </div>
                    </div>
                    <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-gray-400 hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Quản Lý Ngân Sách</h2>
                <button onClick={() => {
                  exportCSV('Ngan_Sach', ['Hạng mục', 'Dự kiến', 'Đã chi', 'Ghi chú'], expenses.map(e => [e.category, e.estimated, e.spent, e.notes]));
                  notify('Đã tải xuống file Excel Ngân sách!');
                }} className="px-3.5 py-1.5 rounded-xl border border-[#D47365] text-[#D47365] text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Xuất Excel
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setExpenses([{ id: Date.now().toString(), category: newExpenseCat, estimated: Number(newExpenseEst) || 0, spent: Number(newExpenseSpent) || 0, notes: '' }, ...expenses]);
                setNewExpenseEst(''); setNewExpenseSpent('');
                notify('Đã thêm khoản chi!');
              }} className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-4 gap-3 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                <input type="text" value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)} placeholder="Hạng mục..." className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" required />
                <input type="number" value={newExpenseEst} onChange={e => setNewExpenseEst(e.target.value)} placeholder="Dự kiến (VNĐ)" className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" required />
                <input type="number" value={newExpenseSpent} onChange={e => setNewExpenseSpent(e.target.value)} placeholder="Đã chi (VNĐ)" className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
                <button type="submit" className="py-2 rounded-xl bg-[#D47365] text-white text-xs font-semibold hover:bg-[#c26254] cursor-pointer">Thêm</button>
              </form>

              <div className={`rounded-2xl border overflow-x-auto ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-inherit text-gray-500">
                    <tr><th className="p-3.5">Hạng mục</th><th className="p-3.5">Dự kiến</th><th className="p-3.5">Đã chi</th><th className="p-3.5">Ghi chú</th></tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td className="p-3.5 font-bold">{e.category}</td>
                        <td className="p-3.5">{e.estimated.toLocaleString()} đ</td>
                        <td className="p-3.5 text-[#D47365] font-semibold">{e.spent.toLocaleString()} đ</td>
                        <td className="p-3.5 text-gray-400">{e.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Khách Mời ({guests.length})</h2>
                <button onClick={() => {
                  exportCSV('Khach_Moi', ['Họ tên', 'SĐT', 'Bên', 'Số người', 'Bàn', 'RSVP'], guests.map(g => [g.name, g.phone, g.side, g.pax, g.table, g.rsvp]));
                  notify('Đã tải xuống file Excel Khách mời!');
                }} className="px-3.5 py-1.5 rounded-xl border border-[#D47365] text-[#D47365] text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Xuất Excel
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newGuestName.trim()) return;
                setGuests([{ id: Date.now().toString(), name: newGuestName.trim(), phone: newGuestPhone.trim(), side: newGuestSide, pax: Number(newGuestPax) || 1, rsvp: 'Chưa trả lời', table: 'Chưa xếp' }, ...guests]);
                setNewGuestName(''); setNewGuestPhone('');
                notify('Đã thêm khách mời!');
              }} className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-5 gap-3 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                <input type="text" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} placeholder="Tên khách..." className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" required />
                <input type="tel" value={newGuestPhone} onChange={e => setNewGuestPhone(e.target.value)} placeholder="Số điện thoại" className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
                <select value={newGuestSide} onChange={e => setNewGuestSide(e.target.value as any)} className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent">
                  <option value="Cô dâu" className="text-black">Cô dâu</option>
                  <option value="Chú rể" className="text-black">Chú rể</option>
                </select>
                <input type="number" min={1} value={newGuestPax} onChange={e => setNewGuestPax(e.target.value)} className="px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
                <button type="submit" className="py-2 rounded-xl bg-[#D47365] text-white text-xs font-semibold hover:bg-[#c26254] cursor-pointer">Thêm khách</button>
              </form>

              <div className={`rounded-2xl border overflow-x-auto ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-inherit text-gray-500">
                    <tr><th className="p-3.5">Họ tên</th><th className="p-3.5">SĐT</th><th className="p-3.5">Bên</th><th className="p-3.5">Bàn</th><th className="p-3.5">RSVP</th></tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {guests.map(g => (
                      <tr key={g.id}>
                        <td className="p-3.5 font-bold">{g.name}</td>
                        <td className="p-3.5 text-gray-400">{g.phone || '-'}</td>
                        <td className="p-3.5">{g.side}</td>
                        <td className="p-3.5 text-[#D47365] font-semibold">{g.table}</td>
                        <td className="p-3.5">
                          <button onClick={() => {
                            const next = g.rsvp === 'Chưa trả lời' ? 'Tham dự' : g.rsvp === 'Tham dự' ? 'Không tham dự' : 'Chưa trả lời';
                            setGuests(guests.map(x => x.id === g.id ? { ...x, rsvp: next } : x));
                          }} className="px-2 py-1 rounded bg-[#D47365]/10 text-[#D47365] text-[10px] font-bold cursor-pointer">
                            {g.rsvp}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Nhà Cung Cấp & Dịch Vụ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendors.map(v => (
                  <div key={v.id} className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <span className="text-[10px] font-bold text-[#D47365] bg-[#D47365]/10 px-2 py-0.5 rounded">{v.category}</span>
                    <h4 className="font-bold text-base">{v.name}</h4>
                    <p className="text-xs text-gray-400">{v.phone}</p>
                    <div className="flex justify-between text-xs pt-2 border-t border-inherit">
                      <span>Hợp đồng: <strong>{(v.price / 1e6).toFixed(1)} tr</strong></span>
                      <span>Đã cọc: <strong className="text-emerald-500">{(v.deposit / 1e6).toFixed(1)} tr</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Lịch Trình Ngày Cưới</h2>
              <div className="space-y-3">
                {timeline.map(tl => (
                  <div key={tl.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <span className="text-xs font-bold text-[#D47365] bg-[#D47365]/10 px-3 py-1 rounded-xl shrink-0">{tl.time}</span>
                    <div>
                      <h4 className="font-bold text-sm">{tl.title}</h4>
                      <p className="text-xs text-gray-400">{tl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seating' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Sơ Đồ Bàn Tiệc</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tables.map(tbl => (
                  <div key={tbl.id} className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">{tbl.name}</h4>
                      <Utensils className="w-4 h-4 text-[#D47365]" />
                    </div>
                    <span className="text-xs text-gray-400">Sức chứa: {tbl.capacity} người</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Sổ Tay Ghi Chú</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
                    <h4 className="font-bold text-sm">{n.title}</h4>
                    <p className="text-xs text-gray-400 whitespace-pre-line">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`max-w-xl p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
              <h2 className="text-xl font-bold">Cài Đặt Đám Cưới</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tên Cô dâu</label>
                  <input type="text" value={wedding.brideName} onChange={e => setWedding({ ...wedding, brideName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tên Chú rể</label>
                  <input type="text" value={wedding.groomName} onChange={e => setWedding({ ...wedding, groomName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Ngày cưới</label>
                <input type="date" value={wedding.weddingDate} onChange={e => setWedding({ ...wedding, weddingDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-inherit text-xs bg-transparent outline-none" />
              </div>
              <button onClick={() => notify('Đã lưu cài đặt!')} className="w-full py-2.5 bg-[#D47365] text-white rounded-xl text-xs font-semibold hover:bg-[#c26254] cursor-pointer">
                Lưu Thay Đổi
              </button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className={`max-w-xl p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold">Bảng Quản Trị Tối Cao</h2>
              </div>
              <p className="text-xs text-gray-500">Mời thành viên đồng quản lý qua Supabase Email Invitation.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!inviteEmail.includes('@')) { notify('Email không hợp lệ!'); return; }
                notify(`Đã kích hoạt gửi lời mời tới: ${inviteEmail}`);
                setInviteEmail('');
              }} className="space-y-3 pt-2">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="partner@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-inherit text-xs bg-transparent outline-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#D47365] text-white text-xs font-semibold rounded-xl hover:bg-[#c26254] cursor-pointer">
                  Gửi Thư Mời Thành Viên
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center px-2 py-2 z-30 ${isDarkMode ? 'bg-[#241F1C] border-[#382E29]' : 'bg-white border-[#ECDCCF]'}`}>
        {navItems.slice(0, 4).map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${active ? 'text-[#D47365]' : 'text-gray-400'}`}>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button onClick={() => setIsMobileDrawerOpen(true)} className="flex flex-col items-center gap-1 text-[10px] font-semibold text-gray-400">
          <Menu className="w-4 h-4" />
          <span>Thêm</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className={`relative w-4/5 max-w-[280px] h-full shadow-2xl flex flex-col p-5 space-y-4 ${isDarkMode ? 'bg-[#241F1C]' : 'bg-white'}`}>
            <div className="flex justify-between items-center border-b border-inherit pb-3">
              <span className="font-bold text-sm">Menu Mở Rộng</span>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {navItems.slice(4).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-[#D47365] hover:bg-[#D47365]/10"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}