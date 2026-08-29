import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { Star, ThumbsUp } from "lucide-react";

export function MentorReputacion() {
  const mentorProfile = useQuery(api.users.getMentorProfile);
  const resenas = useQuery(api.users.getResenasDeMentor, mentorProfile ? { mentorId: mentorProfile._id } : "skip");
  const votarUtil = useMutation(api.users.votarResenaUtil);

  if (!mentorProfile) return <p className="text-slate-400">Cargando perfil de mentor...</p>;

  const rating = mentorProfile.calificacionPromedio || 0;
  const totalReviews = mentorProfile.numeroDeResenas || 0;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Summary Card */}
      <div className="bg-ink-soft p-8 rounded-2xl border border-white/10 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Tu Reputación</h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={`w-8 h-8 ${i <= Math.round(rating) ? "text-yellow-400 fill-current" : "text-slate-600"}`}
            />
          ))}
        </div>
        <p className="text-3xl font-bold text-white">{rating > 0 ? rating.toFixed(1) : "Sin calificar"}</p>
        <p className="text-slate-400 text-sm mt-1">{totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"} en total</p>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Opiniones de tus alumnos</h3>
        <div className="space-y-4">
          {resenas?.map(r => (
            <div key={r._id} className="bg-ink-soft p-5 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= r.puntuacion ? "text-yellow-400 fill-current" : "text-slate-600"}`} />
                ))}
              </div>
              <p className="text-slate-300 text-sm italic mb-3">"{r.comentario}"</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {r.votosUtiles} {r.votosUtiles === 1 ? "persona encontró esto útil" : "personas encontraron esto útil"}
                </span>
                <button
                  onClick={async () => {
                    await votarUtil({ resenaId: r._id });
                    toast.success("¡Voto registrado!");
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-2 transition px-3 py-1 rounded-lg border border-white/10 hover:border-brand/30"
                >
                  <ThumbsUp className="w-3 h-3" /> Útil
                </button>
              </div>
            </div>
          ))}
          {resenas?.length === 0 && <p className="text-slate-400">Aún no tienes reseñas. ¡Empieza a ayudar estudiantes para obtener tu primera calificación!</p>}
        </div>
      </div>
    </div>
  );
}
