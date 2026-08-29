import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { Clock, Send, MessageSquare, Briefcase, Plus, Trash2, FileText } from "lucide-react";

const CATEGORIES = ['Cálculo', 'Física', 'Programación', 'Diseño', 'Idiomas', 'Música', 'Negocios', 'Otro'];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace instantes";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

export function MentorMuro() {
  const dudasAbiertas = useQuery(api.publications.getDudasAbiertas);
  const mentorProfile = useQuery(api.users.getMentorProfile);
  const postular = useMutation(api.publications.postularADuda);

  const [dudaSeleccionada, setDudaSeleccionada] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipoCobro, setTipoCobro] = useState<"fijo_por_trabajo" | "por_hora">("fijo_por_trabajo");

  if (!mentorProfile) return <p className="text-white">Cargando perfil de mentor...</p>;

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-bold mb-6 text-white">Muro de Dudas Disponibles</h2>
      <p className="text-slate-400 mb-8">Aquí ves las dudas en tiempo real de estudiantes buscando ayuda.</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {dudasAbiertas?.map(d => (
          <div key={d._id} className="bg-ink-soft p-6 rounded-xl border border-white/10 flex flex-col h-full shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-brand/20 text-brand px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                {d.categoria}
              </span>
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(d._creationTime)}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{d.titulo}</h3>
            {d.student && <p className="text-xs text-slate-500 mb-2">Por: {d.student.nombre} {d.student.apellido}</p>}
            <p className="text-slate-400 text-sm mb-4 line-clamp-3">{d.descripcion}</p>
            
            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Presupuesto</p>
                <p className="text-brand-2 font-bold">${d.precioOfrecido}</p>
              </div>
              
              {dudaSeleccionada === d._id ? (
                 <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
                   <div className="bg-ink-soft border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                     <h4 className="text-xl font-bold text-white mb-4">Enviar Oferta</h4>
                     <p className="text-sm text-slate-400 mb-4">{d.titulo}</p>
                     <textarea placeholder="Hola, te puedo ayudar con esto..." value={mensaje} onChange={e=>setMensaje(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none h-24 mb-4" />
                     <input type="number" placeholder="Tu precio ($)" value={precio} onChange={e=>setPrecio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none mb-4" />
                     
                     <div className="mb-6">
                       <p className="text-sm text-slate-400 mb-2">Tipo de cobro</p>
                       <div className="flex gap-3">
                         <label className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition text-sm ${tipoCobro === "fijo_por_trabajo" ? "border-brand bg-brand/20 text-white" : "border-white/10 text-slate-400 hover:bg-white/5"}`}>
                           <input type="radio" name="tipoCobro" className="hidden" checked={tipoCobro === "fijo_por_trabajo"} onChange={() => setTipoCobro("fijo_por_trabajo")} />
                           Precio fijo
                         </label>
                         <label className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition text-sm ${tipoCobro === "por_hora" ? "border-brand bg-brand/20 text-white" : "border-white/10 text-slate-400 hover:bg-white/5"}`}>
                           <input type="radio" name="tipoCobro" className="hidden" checked={tipoCobro === "por_hora"} onChange={() => setTipoCobro("por_hora")} />
                           Por hora
                         </label>
                       </div>
                     </div>

                     <div className="flex gap-3">
                       <button onClick={() => setDudaSeleccionada(null)} className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
                       <button 
                         onClick={async () => {
                           await postular({ publicacionId: d._id as any, mentorId: mentorProfile._id, mensajeCorto: mensaje, precioOfertado: Number(precio), tipoCobro });
                           setDudaSeleccionada(null);
                           setMensaje("");
                           setPrecio("");
                           toast.success("¡Oferta enviada con éxito!");
                         }}
                         className="flex-1 bg-brand hover:bg-brand-2 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                       >
                         <Send className="w-4 h-4" /> Enviar
                       </button>
                     </div>
                   </div>
                 </div>
              ) : (
                <button onClick={() => setDudaSeleccionada(d._id)} className="bg-white/10 hover:bg-brand text-white font-semibold text-sm px-4 py-2 rounded-lg transition">
                  Aplicar
                </button>
              )}
            </div>
          </div>
        ))}
        {dudasAbiertas?.length === 0 && <p className="text-slate-400 col-span-2">No hay dudas abiertas en este momento.</p>}
      </div>
    </div>
  );
}

export function MentorPostulaciones({ onGoToChat }: { onGoToChat: () => void }) {
  const mentorProfile = useQuery(api.users.getMentorProfile);
  const postulaciones = useQuery(api.publications.getMisPostulaciones, mentorProfile ? { mentorId: mentorProfile._id } : "skip");

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
        <Briefcase className="w-7 h-7 text-brand" /> Mis Ofertas Enviadas
      </h2>
      <div className="space-y-4">
        {postulaciones?.map(p => (
           <div key={p._id} className="bg-ink-soft p-5 rounded-xl border border-white/10 flex justify-between items-center shadow-lg">
             <div>
               <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${p.estado === 'aceptada' ? 'bg-brand-2/20 text-brand-2' : p.estado === 'rechazada' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                 {p.estado}
               </span>
               <p className="mt-3 text-slate-300">Ofreciste: ${p.precioOfertado} ({p.tipoCobro === "por_hora" ? "por hora" : "precio fijo"})</p>
               <p className="text-sm text-slate-500 mt-1">"{p.mensajeCorto}"</p>
             </div>
             {p.estado === 'aceptada' && (
               <button onClick={onGoToChat} className="flex items-center gap-2 bg-brand-2 text-ink-soft font-bold px-4 py-2 rounded-lg hover:bg-white transition">
                 <MessageSquare className="w-4 h-4" /> Ir al Chat
               </button>
             )}
           </div>
        ))}
        {postulaciones?.length === 0 && <p className="text-slate-400">No has enviado ninguna oferta aún.</p>}
      </div>
    </div>
  );
}

export function MentorAnuncios() {
  const mentorProfile = useQuery(api.users.getMentorProfile);
  const misAnuncios = useQuery(api.publications.getMisAnunciosMentor, mentorProfile ? { mentorId: mentorProfile._id } : "skip");
  const publicar = useMutation(api.publications.publicarAnuncioMentor);
  const eliminar = useMutation(api.publications.eliminarAnuncioMentor);

  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [precio, setPrecio] = useState("");

  if (!mentorProfile) return <p className="text-white">Cargando perfil...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publicar({
        mentorId: mentorProfile._id,
        categoria,
        titulo,
        descripcionDetallada: descripcion,
        metodologia,
        precioPorHoraSugerido: Number(precio),
      });
      setTitulo("");
      setDescripcion("");
      setMetodologia("");
      setPrecio("");
      toast.success("¡Anuncio publicado exitosamente!");
    } catch {
      toast.error("Error al publicar el anuncio");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-ink-soft p-6 rounded-xl border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-brand-2 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Publicar Nuevo Anuncio
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Categoría</label>
              <select value={categoria} onChange={e=>setCategoria(e.target.value)} className="w-full bg-ink border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Precio por hora ($)</label>
              <input required type="number" placeholder="25" value={precio} onChange={e=>setPrecio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Título del servicio</label>
            <input required placeholder="Ej: Clases de Cálculo Diferencial para universitarios" value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Descripción detallada</label>
            <textarea required placeholder="Describe tu experiencia y qué ofreces..." value={descripcion} onChange={e=>setDescripcion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none h-24" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Metodología</label>
            <textarea required placeholder="Cómo estructuras tus sesiones, qué material usas..." value={metodologia} onChange={e=>setMetodologia(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none h-20" />
          </div>
          <button type="submit" className="w-full bg-brand hover:bg-brand-2 text-white font-bold rounded-lg py-3 transition">Publicar Anuncio</button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" /> Mis Anuncios Activos
        </h3>
        <div className="space-y-4">
          {misAnuncios?.map(a => (
            <div key={a._id} className="bg-ink-soft p-5 rounded-xl border border-white/10 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand/20 text-brand px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{a.categoria}</span>
                    <span className="text-brand-2 font-bold text-sm">${a.precioPorHoraSugerido}/hr</span>
                  </div>
                  <h4 className="text-white font-bold text-lg">{a.titulo}</h4>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{a.descripcionDetallada}</p>
                  <p className="text-slate-500 text-xs mt-2 italic">Metodología: {a.metodologia}</p>
                </div>
                <button 
                  onClick={async () => {
                    await eliminar({ anuncioId: a._id });
                    toast.success("Anuncio eliminado");
                  }}
                  className="text-red-400 hover:text-red-300 transition p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {misAnuncios?.length === 0 && <p className="text-slate-400">No has publicado anuncios aún.</p>}
        </div>
      </div>
    </div>
  );
}
