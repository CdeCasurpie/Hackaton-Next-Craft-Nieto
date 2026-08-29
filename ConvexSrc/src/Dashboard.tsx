import { motion } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";
import { AnimatedBackground } from "./Background";

type Role = "student" | "mentor";

type DashboardProps = {
  fullName: string;
  role: Role;
};

export default function Dashboard({ fullName, role }: DashboardProps) {
  const { signOut } = useAuthActions();
  const isStudent = role === "student";

  const studentActions = [
    { icon: "📝", title: "Publicar un problema", text: "Cuenta qué necesitas aprender.", soon: true },
    { icon: "📬", title: "Mis publicaciones", text: "Revisa quién te ha contactado.", soon: true },
    { icon: "🔍", title: "Explorar mentores", text: "Descubre perfiles y valoraciones.", soon: true },
    { icon: "💬", title: "Mis mensajes", text: "Chatea con tus mentores.", soon: true },
  ];

  const mentorActions = [
    { icon: "🗂️", title: "Explorar publicaciones", text: "Encuentra estudiantes que necesitan tu ayuda.", soon: true },
    { icon: "✨", title: "Mi perfil-vitrina", text: "Muestra tu experiencia y tarifas.", soon: true },
    { icon: "⭐", title: "Mis reseñas y ranking", text: "Mira tus valoraciones.", soon: true },
    { icon: "💬", title: "Mis mensajes", text: "Chatea con tus estudiantes.", soon: true },
  ];

  const actions = isStudent ? studentActions : mentorActions;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <header className="border-b border-white/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 font-bold text-white shadow-lg">
              N
            </div>
            <span className="text-lg font-semibold tracking-tight">
              The Next <span className="text-gradient">Craft</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-300 sm:block">
              {fullName}{" "}
              <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs text-brand-2">
                {isStudent ? "Estudiante" : "Mentor"}
              </span>
            </span>
            <button
              onClick={() => void signOut()}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          Hola, <span className="text-gradient">{fullName.split(" ")[0] || "bienvenido"}</span> 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-slate-300"
        >
          {isStudent
            ? "Publica tus problemas y deja que los mentores te encuentren."
            : "Encuentra estudiantes que necesitan justo lo que tú enseñas."}
        </motion.p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {actions.map((a, i) => (
            <motion.button
              key={a.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glow-border relative rounded-2xl border border-white/10 bg-ink-soft/60 p-6 text-left backdrop-blur-md"
            >
              <div className="text-3xl">{a.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{a.text}</p>
              {a.soon && (
                <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-300">
                  Próximamente
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
