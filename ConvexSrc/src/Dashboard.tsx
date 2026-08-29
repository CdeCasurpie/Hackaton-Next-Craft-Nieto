import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import toast from "react-hot-toast";
import { api } from "../convex/_generated/api";
import Sidebar from "./components/dashboard/Sidebar";
import { Navbar } from "./Landing";

// Importar Vistas
import { StudentDudas, StudentOfertas, StudentMentores } from "./components/dashboard/StudentViews";
import { MentorMuro, MentorPostulaciones, MentorAnuncios } from "./components/dashboard/MentorViews";
import { MentorReputacion } from "./components/dashboard/MentorReputacion";
import { ChatView } from "./components/dashboard/ChatView";

type Role = "student" | "mentor";

type DashboardProps = {
  fullName: string;
  role: Role;
  onGoHome?: () => void;
};

export default function Dashboard({ fullName, role: initialRole, onGoHome }: DashboardProps) {
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);
  const defaultStudentTab = "student-dashboard";
  const defaultMentorTab = "mentor-muro";
  const [activeTab, setActiveTab] = useState<string>(currentRole === "student" ? defaultStudentTab : defaultMentorTab);

  const mentorProfile = useQuery(api.users.getMentorProfile);
  const currentUser = useQuery(api.users.getCurrentUser);
  const mejorarAMentor = useMutation(api.users.mejorarAMentor);

  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");

  const handleRoleSwitch = (newRole: Role) => {
    setCurrentRole(newRole);
    setActiveTab(newRole === "student" ? defaultStudentTab : defaultMentorTab);
  };

  const goToChat = () => setActiveTab("chat");

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await mejorarAMentor({ userId: currentUser._id, dni, celular, correoPersonal: currentUser.email || "" });
      toast.success("¡Felicidades! Ahora eres mentor.");
    }
  };

  const renderView = () => {
    // Si intenta ser mentor pero aún no ha llenado sus datos
    if (currentRole === "mentor" && mentorProfile === null && currentUser) {
      return (
        <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-ink-soft border border-brand/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Conviértete en Mentor</h2>
          <p className="text-slate-400 text-sm mb-6">Para poder ofrecer tus servicios y ver las solicitudes, necesitamos un par de datos de seguridad obligatorios.</p>
          <form onSubmit={handleUpgrade} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-2">DNI / Documento de Identidad</label>
              <input required value={dni} onChange={e=>setDni(e.target.value)} placeholder="00000000" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-300 block mb-2">Celular</label>
              <input required value={celular} onChange={e=>setCelular(e.target.value)} placeholder="+123456789" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
            </div>
            <button type="submit" className="w-full bg-brand hover:bg-brand-2 text-white font-bold py-3 rounded-lg transition mt-4">
              Activar cuenta de Mentor
            </button>
          </form>
        </div>
      );
    }

    switch (activeTab) {
      case "student-dashboard": return <StudentDudas />;
      case "student-ofertas": return <StudentOfertas />;
      case "student-mentores": return <StudentMentores onSelectMentor={() => {}} />;
      
      case "mentor-muro": return <MentorMuro />;
      case "mentor-postulaciones": return <MentorPostulaciones onGoToChat={goToChat} />;
      case "mentor-anuncios": return <MentorAnuncios />;
      case "mentor-perfil": return <MentorReputacion />;
      
      case "chat": return <ChatView role={currentRole} />;
      default: return null;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent flex">

      <Navbar 
        onGetStarted={() => {}} 
        onSignIn={() => {}} 
        userProfile={{ fullName }} 
        onGoHome={onGoHome} 
      />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={currentRole} 
        onRoleSwitch={handleRoleSwitch}
      />

      <main className="flex-1 pl-[300px] mt-[76px] h-[calc(100vh-76px)] overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto w-full p-8 pb-16">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white"
              >
                Hola, <span className="text-brand-2">{fullName.split(" ")[0]}</span>
              </motion.h1>
              <p className="text-slate-400 text-sm mt-1">Estás en modo {currentRole === "student" ? "Estudiante" : "Mentor"}</p>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
