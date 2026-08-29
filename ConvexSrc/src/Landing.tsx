import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, type Variants, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, Zap, MessageCircle, ShieldCheck, Target } from "lucide-react";

type Role = "student" | "mentor";

type LandingProps = {
  onGetStarted: (role?: Role) => void;
  onSignIn: () => void;
  userProfile?: { fullName: string };
  onGoToDashboard?: () => void;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6 }}
      className="pointer-events-none select-none"
      aria-hidden="true"
    >
      <motion.svg
        width="150"
        height="170"
        viewBox="0 0 150 170"
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 18px 30px rgba(109,94,252,0.45))" }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5e4ddf" />
            <stop offset="100%" stopColor="#f47286" />
          </linearGradient>
        </defs>

        <line x1="75" y1="34" x2="75" y2="16" stroke="#c7cbe6" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="75" cy="13" r="5" fill="#f47286"
          animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <rect x="35" y="34" width="80" height="66" rx="20" fill="url(#bodyGrad)" />

        <polygon points="75,20 118,36 75,52 32,36" fill="#1b2136" />
        <rect x="70" y="44" width="10" height="10" fill="#1b2136" />
        <line x1="118" y1="36" x2="118" y2="58" stroke="#f47286" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="118" cy="60" r="3.5" fill="#f47286" />

        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.94, 0.98, 1], ease: "easeInOut" }}
        >
          <circle cx="58" cy="62" r="9" fill="#ffffff" />
          <circle cx="92" cy="62" r="9" fill="#ffffff" />
          <circle cx="60" cy="63" r="4" fill="#1b2136" />
          <circle cx="94" cy="63" r="4" fill="#1b2136" />
        </motion.g>

        <circle cx="48" cy="80" r="5" fill="#f47286" opacity="0.6" />
        <circle cx="102" cy="80" r="5" fill="#f47286" opacity="0.6" />

        <path d="M63 82 Q75 92 87 82" stroke="#1b2136" strokeWidth="3" fill="none" strokeLinecap="round" />

        <rect x="52" y="104" width="46" height="40" rx="14" fill="url(#bodyGrad)" opacity="0.92" />
        <rect x="64" y="114" width="22" height="16" rx="5" fill="#0a0a0f" opacity="0.7" />

        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
          animate={{ rotate: [0, -22, 6, -22, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
        >
          <line x1="100" y1="112" x2="120" y2="98" stroke="#5e4ddf" strokeWidth="7" strokeLinecap="round" />
          <circle cx="122" cy="96" r="6" fill="#f47286" />
        </motion.g>
        <line x1="52" y1="112" x2="36" y2="126" stroke="#5e4ddf" strokeWidth="7" strokeLinecap="round" />
        <circle cx="34" cy="128" r="6" fill="#f47286" />
      </motion.svg>
    </motion.div>
  );
}

export function Navbar({ onGetStarted, onSignIn, userProfile, onGoToDashboard, onGoHome }: LandingProps & { onGoHome?: () => void }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full bg-ink/90 backdrop-blur-md border-b border-white/10"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <button onClick={onGoHome} className="text-3xl tracking-tight text-white hover:opacity-80 transition text-left font-logo flex items-center gap-3">
            <img src="/logo.png" alt="Atenea" className="w-8 h-8 rounded-full" />
            Atenea
          </button>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#como-funciona" className="transition hover:text-white">Cómo funciona</a>
          <a href="#beneficios" className="transition hover:text-white">Beneficios</a>
          <a href="#cta" className="transition hover:text-white">Empezar</a>
        </nav>
        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-slate-300 md:block">
                Hola, <span className="font-semibold text-white">{userProfile.fullName}</span>
              </span>
              <button
                onClick={onGoToDashboard}
                className="rounded-lg bg-gradient-to-r from-brand to-brand-2 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 shadow-lg"
              >
                Ir al Dashboard →
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition hover:text-white sm:block"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => onGetStarted()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-200"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  
  // Efecto Parallax en scroll
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 150]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { view: "directorio", searchParams: { query: searchQuery, location } },
      })
    );
  };

  return (
    <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row items-center justify-between gap-12 px-6 pt-32 lg:pt-16 pb-20 overflow-hidden">
      
      {/* Columna Izquierda: Texto y Búsqueda */}
      <motion.div style={{ y: y1 }} className="w-full lg:w-1/2 flex flex-col text-left z-10">
        <motion.span
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-block self-start rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 mb-6"
        >
          El primer marketplace educativo para universitarios
        </motion.span>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-7xl md:text-8xl font-logo mb-2 text-white drop-shadow-xl tracking-wider"
        >
          Atenea
        </motion.h1>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1.5}
          className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl mb-8 text-slate-200"
        >
          ¿Qué quieres resolver <span className="text-gradient">hoy?</span>
        </motion.h2>

        {/* Barra de Búsqueda Dual */}
        <motion.form 
          onSubmit={handleSearch}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="flex flex-col md:flex-row bg-ink-soft/80 border border-white/20 backdrop-blur-xl p-2 rounded-2xl md:rounded-full shadow-2xl shadow-brand/10 w-full"
        >
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
            <Search className="w-5 h-5 mr-3 text-slate-400" />
            <input 
              required
              type="text" 
              placeholder="Materia, habilidad o tema..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base"
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-2 mt-2 md:mt-0">
            <MapPin className="w-5 h-5 mr-3 text-slate-400" />
            <select 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-transparent text-slate-300 focus:outline-none text-base appearance-none cursor-pointer"
            >
              <option value="" className="bg-ink text-slate-300">Cualquier modalidad</option>
              <option value="online" className="bg-ink text-slate-300">En línea (Webcam)</option>
              <option value="presencial" className="bg-ink text-slate-300">Presencial (Campus)</option>
            </select>
          </div>
          <button type="submit" className="mt-4 md:mt-0 md:ml-2 bg-gradient-to-r from-brand to-brand-2 hover:opacity-90 text-white font-bold text-base px-6 py-3 rounded-xl md:rounded-full transition">
            BUSCAR
          </button>
        </motion.form>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-6 flex flex-wrap justify-start gap-3 text-sm"
        >
          <span className="text-slate-400 mr-2 py-1">Populares:</span>
          {["Programación Web", "Matemáticas", "Física", "Diseño UX"].map(tag => (
            <button 
              key={tag}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                handleSearch(new Event('submit') as any);
              }}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Columna Derecha: Logo Gigante */}
      <motion.div 
        style={{ y: y2 }}
        className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.img 
          src="/logo.png" 
          alt="Atenea Logo" 
          className="w-full max-w-md lg:max-w-lg object-contain"
          style={{ filter: "drop-shadow(0 0 40px rgba(244,114,134,0.3))" }}
          animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
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
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md md:grid-cols-4">
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
            <p className="text-4xl font-bold text-gradient">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-slate-400">{s.label}</p>
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
      title: "Chatean y se ponen de acuerdo",
      text: "Conversan por el chat interno, acuerdan horario y precio, y empiezan a aprender.",
    },
  ];
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="text-center text-4xl font-bold tracking-tight"
      >
        Cómo funciona
      </motion.h2>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        custom={1}
        className="mx-auto mt-4 max-w-lg text-center text-slate-400"
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
            whileHover={{ y: -8 }}
            className="glow-border rounded-2xl border border-white/10 bg-ink-soft/60 p-8 backdrop-blur-md"
          >
            <span className="text-5xl font-bold text-white/10">{s.n}</span>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-sm text-slate-400">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: <Zap className="w-8 h-8 text-brand-2" />, title: "Sin buscar durante horas", text: "Publicas una vez y los mentores llegan a ti." },
    { icon: <MessageCircle className="w-8 h-8 text-brand-2" />, title: "Chat en tiempo real", text: "Conversaciones instantáneas dentro de la plataforma." },
    { icon: <ShieldCheck className="w-8 h-8 text-brand-2" />, title: "Mentores verificados", text: "Perfiles con experiencia y valoraciones reales." },
    { icon: <Target className="w-8 h-8 text-brand-2" />, title: "A tu medida", text: "Filtra por materia, nivel, precio y modalidad." },
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
            whileHover={{ scale: 1.04 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mb-4">{it.icon}</div>
            <h3 className="font-semibold">{it.title}</h3>
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
        className="glow-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand/20 to-brand-2/10 p-12 text-center backdrop-blur-xl"
      >
        <h2 className="text-4xl font-bold tracking-tight">
          ¿Listo para aprender <span className="text-gradient">mejor</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-slate-300">
          Crea tu cuenta gratis y publica tu primer problema hoy mismo.
        </p>
        <button
          onClick={() => onGetStarted()}
          className="mt-8 rounded-xl bg-white px-8 py-3 font-semibold text-ink transition hover:scale-[1.03]"
        >
          Empezar gratis
        </button>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-500">
      <p>© {new Date().getFullYear()} Atenea. Hecho con dedicación.</p>
    </footer>
  );
}

export default function Landing(props: LandingProps) {
  return (
    <div className="relative min-h-screen">
      <Navbar {...props} />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Benefits />
        <CTA {...props} />
      </main>
      <Footer />

      {/* Mascota fija en la esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <Mascot />
      </div>
    </div>
  );
}
