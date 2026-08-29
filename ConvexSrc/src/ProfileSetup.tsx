import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AnimatedBackground } from "./Background";

type Role = "student" | "mentor";

export default function ProfileSetup() {
  const completeProfile = useMutation(api.users.completeProfile);
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await completeProfile({ fullName, role });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center p-4">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-border w-full max-w-md rounded-2xl border border-white/10 bg-ink-soft p-8"
      >
        <h1 className="text-2xl font-bold">¡Casi listo! 🎉</h1>
        <p className="mt-2 text-sm text-slate-400">
          Cuéntanos quién eres para personalizar tu experiencia.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Soy</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === "student"
                    ? "border-brand bg-brand/20 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                🎓 Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === "mentor"
                    ? "border-brand bg-brand/20 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                👨‍🏫 Mentor
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Nombre completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-2 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Continuar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
