import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";
import { PENDING_PROFILE_KEY } from "./pendingProfile";

type Role = "student" | "mentor";
type Mode = "signUp" | "signIn";

type AuthModalProps = {
  initialMode: Mode;
  initialRole?: Role;
  onClose: () => void;
};

export default function AuthModal({ initialMode, initialRole, onClose }: AuthModalProps) {
  const { signIn } = useAuthActions();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>(initialRole ?? "student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signUp") {
        // Guardamos el perfil pendiente ANTES de iniciar sesión.
        // Se aplicará automáticamente cuando la sesión ya esté activa.
        localStorage.setItem(
          PENDING_PROFILE_KEY,
          JSON.stringify({ fullName, role }),
        );
      }
      await signIn("password", { email, password, flow: mode });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        mode === "signUp"
          ? "No se pudo crear la cuenta. Revisa que la contraseña tenga al menos 8 caracteres y que el correo no esté registrado."
          : "No pudimos iniciar sesión. Verifica tu correo y contraseña. Si es tu primera vez, usa \"Regístrate\" para crear tu cuenta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="glow-border w-full max-w-md rounded-2xl border border-white/10 bg-ink-soft p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {mode === "signUp" ? "Crea tu cuenta" : "Inicia sesión"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signUp" && (
            <>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Quiero registrarme como</label>
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
            </>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-brand"
            />
          </div>

          {/* Simulacro de Captcha */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <input type="checkbox" required id="captcha" className="h-5 w-5 rounded border-white/20 text-brand focus:ring-brand focus:ring-offset-ink-soft bg-white/5" />
            <label htmlFor="captcha" className="text-sm text-slate-300">No soy un robot</label>
            <div className="ml-auto flex items-center justify-center opacity-50">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Security Check</span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-2 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Un momento..."
              : mode === "signUp"
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "signUp" ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setError(null);
              setMode(mode === "signUp" ? "signIn" : "signUp");
            }}
            className="font-semibold text-brand-2 hover:underline"
          >
            {mode === "signUp" ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
