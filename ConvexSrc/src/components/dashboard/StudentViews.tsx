import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { BookOpen, Search, Star, Clock, Check, X, User } from "lucide-react";


const CATEGORIES = ['Cálculo', 'Física', 'Programación', 'Diseño', 'Idiomas', 'Música', 'Negocios', 'Otro'];

export function StudentDudas() {
  const misDudas = useQuery(api.publications.getMisDudas);
  const crearDuda = useMutation(api.publications.crearDudaPuntual);
  
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [fechaLimite, setFechaLimite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearDuda({
        categoria,
        titulo,
        descripcion,
        precioOfrecido: Number(precio),
        fechaLimite: fechaLimite ? new Date(fechaLimite).getTime() : undefined
      });
      setTitulo("");
      setDescripcion("");
      setPrecio("");
      setFechaLimite("");
      toast.success("¡Duda publicada exitosamente!");
    } catch {
      toast.error("Error al publicar la duda");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-ink-soft p-6 rounded-xl border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-brand-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> ¿Necesitas ayuda urgente?
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Ej: Ayuda con derivadas parciales" value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
          <textarea required placeholder="Describe tu problema con detalle..." value={descripcion} onChange={e=>setDescripcion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none h-24" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Categoría</label>
              <select value={categoria} onChange={e=>setCategoria(e.target.value)} className="w-full bg-ink border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Presupuesto ($)</label>
              <input required type="number" placeholder="15" value={precio} onChange={e=>setPrecio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Fecha Límite (Opcional)</label>
              <input type="date" value={fechaLimite} onChange={e=>setFechaLimite(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand hover:bg-brand-2 text-white font-bold rounded-lg py-3 transition">Publicar Duda</button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Mis Dudas Activas</h3>
        {misDudas?.map(d => (
          <div key={d._id} className="bg-ink-soft p-5 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-lg text-white">{d.titulo}</h4>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand/20 text-brand rounded-lg">{d.categoria}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${d.estado === 'abierta' ? 'bg-brand-2/20 text-brand-2' : d.estado === 'en_progreso' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                {d.estado}
              </span>
            </div>
            <p className="mt-2 text-slate-400 text-sm">{d.descripcion}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-brand font-semibold">Presupuesto: ${d.precioOfrecido}</span>
              {d.fechaLimite && <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Límite: {new Date(d.fechaLimite).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
        {misDudas?.length === 0 && <p className="text-slate-400">No has publicado dudas aún.</p>}
      </div>
    </div>
  );
}

export function StudentOfertas() {
  const ofertas = useQuery(api.publications.getTodasMisOfertas, {});
  const aceptar = useMutation(api.publications.aceptarOferta);
  const rechazar = useMutation(api.publications.rechazarOferta);

  if (ofertas === undefined) return <p className="text-slate-400">Cargando ofertas...</p>;
  if (ofertas.length === 0) return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-white">Ofertas Recibidas</h2>
      <p className="text-slate-400 bg-ink-soft p-8 rounded-2xl border border-white/10 text-center">No tienes ofertas pendientes en este momento.</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-3xl font-bold text-white">Ofertas Recibidas</h2>
      <div className="space-y-4">
        {ofertas.map(o => {
          const mentorName = o.user ? `${o.user.nombre} ${o.user.apellido}` : "Mentor";
          const pubTitle = (o.publicacion as any)?.titulo || "Publicación";
          return (
            <div key={o._id} className="bg-ink-soft p-5 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-slate-300">
                  Ref: {pubTitle}
                </span>
                <span className={`ml-auto px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${o.estado === 'aceptada' ? 'bg-brand-2/20 text-brand-2' : o.estado === 'rechazada' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                  {o.estado}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-brand to-brand-2 rounded-full flex items-center justify-center text-white font-bold">
                    {mentorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{mentorName}</h4>
                    <p className="text-brand-2 font-bold text-sm">Cobra: ${o.precioOfertado} ({o.tipoCobro === "por_hora" ? "por hora" : "precio fijo"})</p>
                  </div>
                </div>
                {o.estado === 'pendiente' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        await aceptar({ postulacionId: o._id });
                        toast.success("¡Oferta aceptada! Revisa tus mensajes.");
                      }}
                      className="flex items-center gap-1 bg-brand-2 text-ink-soft font-bold px-4 py-2 rounded-lg hover:bg-white transition"
                    >
                      <Check className="w-4 h-4" /> Aceptar
                    </button>
                    <button 
                      onClick={async () => {
                        await rechazar({ postulacionId: o._id });
                        toast.success("Oferta rechazada.");
                      }}
                      className="flex items-center gap-1 bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition border border-red-500/20"
                    >
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-slate-300 text-sm bg-ink p-3 rounded-lg border border-white/5 italic">"{o.mensajeCorto}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudentMentores({ onNavigateToChats }: { onNavigateToChats: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const anuncios = useQuery(api.publications.getAnunciosMentores, {});
  const contactarMentor = useMutation(api.chats.contactarMentor);

  const filtered = anuncios?.filter(a => {
    const term = searchTerm.toLowerCase();
    const mentorName = a.user ? `${a.user.nombre} ${a.user.apellido}`.toLowerCase() : "";
    return (
      a.categoria.toLowerCase().includes(term) ||
      mentorName.includes(term) ||
      a.titulo.toLowerCase().includes(term)
    );
  });

  const handleContactar = async (mentorId: any, origenId: any) => {
    try {
      await contactarMentor({ mentorId, origenId });
      toast.success("¡Chat creado! Coordinen por mensajes.");
      onNavigateToChats();
    } catch (error) {
      toast.error("Error al contactar al mentor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand" /> Directorio de Mentores
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Buscar por categoría, nombre..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-ink-soft border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-brand text-sm"
          />
        </div>
      </div>

      {anuncios === undefined ? (
        <p className="text-slate-400">Cargando mentores...</p>
      ) : filtered?.length === 0 ? (
        <p className="text-slate-400 bg-ink-soft p-8 rounded-2xl border border-white/10 text-center">No se encontraron mentores con esos criterios.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map(anuncio => {
            const mentorName = anuncio.user ? `${anuncio.user.nombre} ${anuncio.user.apellido}` : "Mentor";
            const rating = anuncio.mentor?.calificacionPromedio || 0;
            return (
              <div 
                key={anuncio._id} 
                className="bg-ink-soft border border-white/10 hover:border-brand/50 rounded-2xl p-5 flex flex-col transition-all hover:shadow-[0_0_20px_rgba(109,94,252,0.1)] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-2 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {mentorName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold group-hover:text-brand-2 transition-colors">{mentorName}</h3>
                      <div className="flex items-center gap-1 text-yellow-400 text-xs mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{rating > 0 ? rating.toFixed(1) : "Nuevo"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 rounded-lg border border-white/10">
                    {anuncio.categoria}
                  </span>
                </div>
                
                <h4 className="text-white font-semibold mb-2 text-sm">{anuncio.titulo}</h4>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{anuncio.metodologia}</p>
                
                <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                  <span className="text-brand-2 font-bold">${anuncio.precioPorHoraSugerido}/hr</span>
                  <button 
                    onClick={() => handleContactar(anuncio.mentorId, anuncio._id)}
                    className="px-4 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand text-sm font-semibold rounded-lg transition-colors border border-brand/20"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
