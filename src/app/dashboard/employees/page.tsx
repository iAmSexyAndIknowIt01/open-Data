'use client';

import { useState } from 'react';
import { 
  Users, UserPlus, Search, Mail, Phone, 
  Building2, ShieldCheck, X, Check, Filter, 
  LayoutGrid, List, Trash2, Sparkles 
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'Идэвхтэй' | 'Чөлөөтэй' | 'Идэвхгүй';
  avatarBg: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Бүгд');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Шинэ ажилтан нэмэх формын state
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    department: 'МТ Департмент',
    email: '',
    phone: '',
  });

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Б. Тэмүүлэн', role: 'Ахлах систем хянагч', department: 'Харилцагчийн үйлчилгээ', email: 'temuulen@company.mn', phone: '+976 9911-2233', status: 'Идэвхтэй', avatarBg: 'bg-blue-600' },
    { id: '2', name: 'Д. Хулан', role: 'Техникийн дэмжлэг', department: 'МТ Департмент', email: 'hulan@company.mn', phone: '+976 8811-4455', status: 'Идэвхтэй', avatarBg: 'bg-indigo-600' },
    { id: '3', name: 'Ө. Ганзориг', role: 'CRM Админ', department: 'Борлуулалтын хэлтэс', email: 'ganzorig@company.mn', phone: '+976 9191-7788', status: 'Чөлөөтэй', avatarBg: 'bg-emerald-600' },
    { id: '4', name: 'С. Намуун', role: 'Бүртгэл хариуцагч', department: 'Хүний нөөц', email: 'namuun@company.mn', phone: '+976 9412-3344', status: 'Идэвхтэй', avatarBg: 'bg-amber-600' },
    { id: '5', name: 'Ц. Билгүүн', role: 'Аналитикч', department: 'Санхүү', email: 'bilguun@company.mn', phone: '+976 8000-1234', status: 'Идэвхгүй', avatarBg: 'bg-purple-600' },
  ]);

  const departments = ['Бүгд', 'МТ Департмент', 'Харилцагчийн үйлчилгээ', 'Борлуулалтын хэлтэс', 'Хүний нөөц', 'Санхүү'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'Бүгд' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.role) return;

    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      role: newEmployee.role,
      department: newEmployee.department,
      email: newEmployee.email || 'employee@company.mn',
      phone: newEmployee.phone || '+976 0000-0000',
      status: 'Идэвхтэй',
      avatarBg: randomColor,
    };

    setEmployees([employee, ...employees]);
    setNewEmployee({ name: '', role: '', department: 'МТ Департмент', email: '', phone: '' });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 font-sans antialiased text-slate-800 px-4 sm:px-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100/80 shadow-2xs relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/80 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles size={13} /> Багийн удирдлага
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ажилчдын жагсаалт</h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
            Байгууллагын нийт ажилчдын бүртгэл, холбоо барих мэдээлэл болон хэлтсийн хуваарилалтыг нэг доос харах.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer relative z-10 active:scale-95"
        >
          <UserPlus size={18} /> Шинэ ажилтан нэмэх
        </button>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-2xs">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Нэр, албан тушаал, имэйлээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Departments Scrollable Filter & View Toggle */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
            <Filter size={15} className="text-slate-400 shrink-0 ml-1 mr-1 hidden sm:block" />
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDept === dept 
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Grid / Table View Mode Switcher */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Карт хэлбэрээр харах"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Хүснэгт хэлбэрээр харах"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Employees Content: Grid or Table View */}
      {filteredEmployees.length > 0 ? (
        viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => (
              <div 
                key={emp.id} 
                className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-2xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${emp.avatarBg} text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                        emp.status === 'Идэвхтэй' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : emp.status === 'Чөлөөтэй' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-50 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Building2 size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone size={15} className="text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                    <ShieldCheck size={14} /> Эрх баталгаажсан
                  </span>
                  
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Устгах"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Ажилтан</th>
                    <th className="py-4 px-6">Албан тушаал / Хэлтэс</th>
                    <th className="py-4 px-6">Холбоо барих</th>
                    <th className="py-4 px-6">Статус</th>
                    <th className="py-4 px-6 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${emp.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-extrabold text-slate-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{emp.role}</p>
                        <p className="text-xs text-slate-400">{emp.department}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs space-y-0.5">
                        <p>{emp.email}</p>
                        <p className="text-slate-400">{emp.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block ${
                          emp.status === 'Идэвхтэй' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : emp.status === 'Чөлөөтэй' 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Устгах"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Users size={26} />
          </div>
          <p className="font-extrabold text-slate-800 text-base">Хайсан үр дүн олдсонгүй</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Таны хайсан нэр эсвэл шүүлтүүрээр тохирох ажилтан олдсонгүй. Өөр утгаар хайна уу.</p>
        </div>
      )}

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-black text-lg text-slate-900">Шинэ ажилтан бүртгэх</h3>
                <p className="text-xs text-slate-400">Системд шинэ хэрэглэгч болон багийн гишүүн нэмэх.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Ажилтны овог, нэр</label>
                <input 
                  type="text" 
                  required
                  placeholder="Жишээ: Д. Бат-Эрдэнэ"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Албан тушаал</label>
                <input 
                  type="text" 
                  required
                  placeholder="Жишээ: Ахлах программист"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Хэлтэс / Салбар</label>
                <select 
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="МТ Департмент">МТ Департмент</option>
                  <option value="Харилцагчийн үйлчилгээ">Харилцагчийн үйлчилгээ</option>
                  <option value="Борлуулалтын хэлтэс">Борлуулалтын хэлтэс</option>
                  <option value="Хүний нөөц">Хүний нөөц</option>
                  <option value="Санхүү">Санхүү</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Имэйл хаяг</label>
                  <input 
                    type="email" 
                    placeholder="name@company.mn"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Утасны дугаар</label>
                  <input 
                    type="text" 
                    placeholder="+976 99..."
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Цуцлах
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                >
                  <Check size={16} /> Бүртгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}