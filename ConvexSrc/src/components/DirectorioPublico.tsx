import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../Landing";
import { Search, Star, MapPin } from "lucide-react";

type DirectorioPublicoProps = {
  initialSearchParams?: { query: string; location: string };
  userProfile?: { fullName: string };
  onGoHome: () => void;
  onSignIn: () => void;
  onGetStarted: (role?: "student" | "mentor") => void;
  onGoToDashboard?: () => void;
};

export function DirectorioPublico(props: DirectorioPublicoProps) {
  const [searchTerm, setSearchTerm] = useState(props.initialSearchParams?.query || "");
  const [location, setLocation] = useState(props.initialSearchParams?.location || "");
  
  const anuncios = useQuery(api.publications.getAnunciosMentores, {});

  // Actualizar si cambia por prop
  useEffect(() => {
    if (props.initialSearchParams) {
      setSearchTerm(props.initialSearchParams.query);
      setLocation(props.initialSearchParams.location);
    }
  }, [props.initialSearchParams]);

  const filtered = anuncios?.filter(a => {
    const term = searchTerm.toLowerCase();
    const mentorName = a.user ? `${a.user.nombre} ${a.user.apellido}`.toLowerCase() : "";
    
    const matchesTerm = 
      a.categoria.toLowerCase().includes(term) ||
      mentorName.includes(term) ||
      a.titulo.toLowerCase().includes(term);
      
    // En el futuro location podría filtrar presencial vs online. Por ahora es cosmético/informativo
    return matchesTerm;
  });

  return (
    <div className="relative min-h-screen">
      <Navbar {...props} />

      <main className="relative z-10 pt-32 px-6 pb-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Encuentra al mentor <span className="text-brand-2">ideal</span>
          </h1>
          
          <div className="flex flex-col md:flex-row bg-ink-soft border border-white/20 p-2 rounded-2xl md:rounded-full shadow-2xl mx-auto w-full max-w-3xl">
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
              <Search className="w-5 h-5 mr-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Materia (ej. React, Matemáticas)..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2">
              <MapPin className="w-5 h-5 mr-3 text-slate-400" />
              <select 
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-transparent text-slate-300 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-ink">Cualquier modalidad</option>
                <option value="online" className="bg-ink">En línea</option>
                <option value="presencial" className="bg-ink">Presencial</option>
              </select>
            </div>
          </div>
        </motion.div>

        {anuncios === undefined ? (
          <div className="flex justify-center my-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-20 bg-ink-soft rounded-3xl border border-white/10">
            <p className="text-xl text-white mb-2">No se encontraron resultados</p>
            <p className="text-slate-400">Intenta con otros términos o modalidades de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered?.map((anuncio, idx) => {
              const mentorName = anuncio.user ? `${anuncio.user.nombre} ${anuncio.user.apellido}` : "Mentor";
              const rating = anuncio.mentor?.calificacionPromedio || 0;
              const resenas = anuncio.mentor?.numeroDeResenas || 0;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={anuncio._id}
                  className="bg-ink-soft border border-white/10 hover:border-brand/50 rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Card Header with photo placeholder */}
                  <div className="h-24 bg-gradient-to-r from-brand/20 to-brand-2/20 relative">
                    <div className="absolute -bottom-8 left-4 w-16 h-16 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-ink-soft">
                      {mentorName.charAt(0)}
                    </div>
                    <div className="absolute top-3 right-3 bg-ink/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {rating > 0 ? rating.toFixed(1) : "Nuevo"}
                      {resenas > 0 && <span className="text-slate-400 font-normal ml-1">({resenas})</span>}
                    </div>
                  </div>
                  
                  <div className="pt-10 px-5 pb-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-2 bg-brand-2/10 px-2 py-0.5 rounded">
                        {anuncio.categoria}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1">{mentorName}</h3>
                    <h4 className="text-sm font-medium text-slate-300 mb-3 line-clamp-2">{anuncio.titulo}</h4>
                    
                    <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed flex-1">
                      {anuncio.metodologia}
                    </p>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Tarifa</span>
                        <span className="text-white font-bold">${anuncio.precioPorHoraSugerido}/hr</span>
                      </div>
                      <button 
                        onClick={() => props.onSignIn()} 
                        className="bg-white/10 hover:bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Contactar
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
