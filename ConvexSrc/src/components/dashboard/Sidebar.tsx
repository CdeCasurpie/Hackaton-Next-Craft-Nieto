import { 
  BookOpen, MessageSquare, LayoutDashboard, Search, 
  Briefcase, Star, LogOut 
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: "student" | "mentor";
  onRoleSwitch: (newRole: "student" | "mentor") => void;
};

export default function Sidebar({ activeTab, setActiveTab, role, onRoleSwitch }: SidebarProps) {
  const { signOut } = useAuthActions();

  const studentTabs = [
    { id: "student-dashboard", label: "Mis Dudas", icon: <LayoutDashboard size={20} /> },
    { id: "student-ofertas", label: "Ofertas Recibidas", icon: <Briefcase size={20} /> },
    { id: "student-mentores", label: "Explorar Mentores", icon: <Search size={20} /> },
    { id: "chat", label: "Mensajes", icon: <MessageSquare size={20} /> },
  ];

  const mentorTabs = [
    { id: "mentor-muro", label: "Muro de Dudas", icon: <Search size={20} /> },
    { id: "mentor-postulaciones", label: "Mis Ofertas", icon: <Briefcase size={20} /> },
    { id: "mentor-anuncios", label: "Mis Anuncios", icon: <BookOpen size={20} /> },
    { id: "chat", label: "Mensajes", icon: <MessageSquare size={20} /> },
    { id: "mentor-perfil", label: "Reputación", icon: <Star size={20} /> },
  ];

  const tabs = role === "student" ? studentTabs : mentorTabs;

  return (
    <aside className="fixed left-6 top-[104px] z-40 h-[calc(100vh-128px)] w-64 bg-ink/70 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl">
      <div className="p-5 flex-1 overflow-y-auto">

        {/* Role Switcher */}
        <div className="mb-6 p-1 bg-ink/80 rounded-xl flex text-sm border border-white/5">
          <button 
            onClick={() => onRoleSwitch("student")}
            className={`flex-1 py-2 text-center rounded-lg transition ${role === "student" ? "bg-brand/20 text-brand font-medium shadow" : "text-slate-400 hover:text-slate-300"}`}
          >
            Estudiante
          </button>
          <button 
             onClick={() => onRoleSwitch("mentor")}
            className={`flex-1 py-2 text-center rounded-lg transition ${role === "mentor" ? "bg-brand-2/20 text-brand-2 font-medium shadow" : "text-slate-400 hover:text-slate-300"}`}
          >
            Mentor
          </button>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeTab === tab.id 
                  ? role === "student" ? "bg-brand/10 text-brand font-bold border border-brand/20" : "bg-brand-2/10 text-brand-2 font-bold border border-brand-2/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={() => void signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
