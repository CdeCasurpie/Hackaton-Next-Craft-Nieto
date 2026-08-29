import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, type Variants } from "framer-motion";
import { AnimatedBackground } from "./Background";

type Role = "student" | "mentor";

type LandingProps = {
  onGetStarted: (role?: Role) => void;
  onSignIn: () => void;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Mascot() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
      className="pointer-events-none select-none drop-shadow-2xl"
      aria-hidden="true"
    >
      <motion.svg
        width="90"
        height="100"
        viewBox="0 0 100 110"
        animate={{ y: [0, -10, 0], rotate: [-1, 2, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="roboGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" />
            <stop offset="100%" stopColor="var(--color-brand-2)" />
          </linearGradient>
        </defs>

        {/* Antena */}
        <line x1="50" y1="25" x2="50" y2="10" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="50" cy="8" r="4" fill="var(--color-accent)"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Cabeza */}
        <rect x="15" y="25" width="70" height="60" rx="20" fill="url(#roboGrad)" />
        
        {/* Pantalla */}
        <rect x="25" y="35" width="50" height="35" rx="10" fill="var(--color-ink-soft)" />

        {/* Ojos */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1], ease: "easeInOut" }}
        >
          <circle cx="38" cy="48" r="4" fill="white" />
          <circle cx="62" cy="48" r="4" fill="white" />
        </motion.g>

        {/* Mejillas */}
        <circle cx="30" cy="55" r="3" fill="var(--color-accent)" opacity="0.6" />
        <circle cx="70" cy="55" r="3" fill="var(--color-accent)" opacity="0.6" />

        {/* Boca */}
        <path d="M45 56 Q50 60 55 56" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.svg>
    </motion.div>
  );
}

function Navbar({ onGetStarted, onSignIn }: LandingProps) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full bg-ink/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-bold text-white shadow-lg">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Mentor<span className="text-highlight">Match</span>
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="#como-funciona" className="transition hover:text-white">Cómo funciona</a>
          <a href="#beneficios" className="transition hover:text-white">Beneficios</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="hidden px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => onGetStarted()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-slate-200"
          >
            Registrarse
          </button>
        </div>
      </div>
    </motion.header>
  );
}

function FloatingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-sm"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="student-card p-5"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-brand text-sm font-bold">
            MG
          </div>
          <div>
            <p className="text-sm font-bold text-white">María G.</p>
            <p className="text-xs text-slate-400">Estudiante · Cálculo</p>
          </div>
          <span className="ml-auto rounded bg-brand-2/20 px-2 py-1 text-[10px] font-bold text-brand-2 uppercase tracking-wide">
            Urgente
          </span>
        </div>
        <p className="text-sm text-slate-300 font-medium">
          "Necesito ayuda con integrales para mi examen del viernes. Nivel
          universitario, modalidad online."
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="rounded bg-white/10 px-2.5 py-1 text-slate-300">Cálculo</span>
          <span className="rounded bg-white/10 px-2.5 py-1 text-slate-300">Online</span>
          <span className="rounded bg-accent/20 text-accent px-2.5 py-1">$15 Ofrecido</span>
        </div>
        <button className="mt-5 w-full rounded-lg bg-brand py-2 text-sm font-bold text-white transition hover:bg-brand-2">
          Enviar Oferta
        </button>
      </motion.div>
    </motion.div>
  );
}

function Hero({ onGetStarted }: LandingProps) {
  return (
    <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 pt-28 md:flex-row md:pt-0">
      <div className="flex-1">
        <motion.span
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-block rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-bold text-brand-2 tracking-wide uppercase"
        >
          El marketplace del aprendizaje
        </motion.span>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl text-white"
        >
          Publica tu problema.
          <br />
          <span className="text-highlight">Deja que el experto llegue.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-6 max-w-md text-lg text-slate-400 font-medium"
        >
          Los estudiantes cuentan qué necesitan aprender. Los profesores y
          mentores los contactan directamente. Sin buscar, sin esperar.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-8 flex flex-wrap gap-4"
        >
          <button
            onClick={() => onGetStarted("student")}
            className="rounded-lg bg-brand px-6 py-3 font-bold text-white shadow-lg transition hover:bg-brand-2 hover:-translate-y-1"
          >
            Soy estudiante
          </button>
          <button
            onClick={() => onGetStarted("mentor")}
            className="rounded-lg border-2 border-white/20 bg-transparent px-6 py-3 font-bold text-white transition hover:bg-white/10 hover:-translate-y-1"
          >
            Soy mentor
          </button>
        </motion.div>
      </div>

      <div className="flex flex-1 justify-center">
        <FloatingCard />
      </div>
    </section>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("es")}
      {suffix}
    </span>
  );
}

function Stats() {
  const stats = [
    { to: 1200, suffix: "+", label: "Estudiantes activos" },
    { to: 350, suffix: "+", label: "Mentores verificados" },
    { to: 98, suffix: "%", label: "Conexiones exitosas" },
    { to: 24, suffix: "h", label: "Tiempo medio de contacto" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-2 gap-6 rounded-xl border border-white/10 bg-ink-soft p-8 md:grid-cols-4 shadow-xl">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            className="text-center"
          >
            <p className="text-4xl font-bold text-brand-2">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Publica tu necesidad",
      text: "Cuenta qué materia, tu nivel y cómo prefieres las clases. Toma menos de un minuto.",
    },
    {
      n: "02",
      title: "Los mentores te encuentran",
      text: "Profesores verificados revisan tu publicación y te escriben si pueden ayudarte.",
    },
    {
      n: "03",
      title: "Aprende de inmediato",
      text: "Conversan por el chat interno, acuerdan horario y precio, y empiezan la clase.",
    },
  ];
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="text-center text-4xl font-bold tracking-tight text-white"
      >
        Cómo funciona
      </motion.h2>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        custom={1}
        className="mx-auto mt-4 max-w-lg text-center text-slate-400 font-medium"
      >
        Un flujo simple pensado para que dejes de buscar y empieces a aprender.
      </motion.p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-white/10 bg-ink-soft p-8 shadow-lg"
          >
            <span className="text-5xl font-bold text-white/5">{s.n}</span>
            <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { title: "Sin buscar por horas", text: "Publicas una vez y los mentores llegan a ti." },
    { title: "Chat en tiempo real", text: "Conversaciones instantáneas dentro de la plataforma." },
    { title: "Mentores verificados", text: "Perfiles con experiencia y valoraciones reales." },
    { title: "A tu medida", text: "Filtra por materia, nivel, precio y modalidad." },
  ];
  return (
    <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            className="rounded-xl border-l-4 border-brand-2 bg-ink-soft p-6 shadow-md"
          >
            <h3 className="font-bold text-white">{it.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{it.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA({ onGetStarted }: LandingProps) {
  return (
    <section id="cta" className="mx-auto max-w-4xl px-6 py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl bg-brand p-12 text-center shadow-2xl"
      >
        <h2 className="text-4xl font-bold tracking-tight text-white">
          ¿Listo para aprender <span className="text-brand-2">mejor</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-blue-100 font-medium">
          Crea tu cuenta gratis y publica tu primer problema hoy mismo.
        </p>
        <button
          onClick={() => onGetStarted()}
          className="mt-8 rounded-lg bg-white px-8 py-3 font-bold text-brand shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          Empezar gratis
        </button>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 text-center text-sm font-medium text-slate-600">
      <p>© {new Date().getFullYear()} MentorMatch. Construido con Convex.</p>
    </footer>
  );
}

export default function Landing(props: LandingProps) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar {...props} />
      <main>
        <Hero {...props} />
        <Stats />
        <HowItWorks />
        <Benefits />
        <CTA {...props} />
      </main>
      <Footer />

      {/* Mascota */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <Mascot />
      </div>
    </div>
  );
}
