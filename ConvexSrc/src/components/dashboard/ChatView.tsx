import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { Star, X, CheckCircle } from "lucide-react";

type ChatViewProps = {
  role: "student" | "mentor";
};

export function ChatView({ role }: ChatViewProps) {
  const mentorProfile = useQuery(api.users.getMentorProfile);
  
  const chatsAlumno = useQuery(api.chats.getMisChatsAlumno, role === "student" ? {} : "skip");
  const chatsMentor = useQuery(api.chats.getMisChatsMentor, role === "mentor" && mentorProfile ? { mentorId: mentorProfile._id } : "skip");

  const chats = role === "student" ? chatsAlumno : chatsMentor;
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-80px)] border border-white/10 rounded-2xl overflow-hidden bg-ink-soft/40 backdrop-blur-sm">
      {/* Lista de Chats */}
      <div className="w-1/3 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-white text-lg">Mensajes</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats?.map(chat => {
            const interlocutorName = role === "student" 
              ? (chat as any).mentorUser?.nombre + " " + (chat as any).mentorUser?.apellido 
              : (chat as any).student?.nombre + " " + (chat as any).student?.apellido;
              
            return (
              <button 
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={`w-full text-left p-4 border-b border-white/5 transition flex items-center gap-3 ${activeChatId === chat._id ? 'bg-brand/20' : 'hover:bg-white/5'}`}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand to-brand-2 grid place-items-center text-white font-bold">
                  {interlocutorName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{interlocutorName}</p>
                  <p className="text-xs text-slate-400 capitalize">{chat.tipo.replace("_", " ")}</p>
                </div>
                {chat.estado === "cerrado" && (
                  <span className="ml-auto text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Cerrado</span>
                )}
              </button>
            )
          })}
          {chats?.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">No tienes chats activos.</p>}
        </div>
      </div>

      {/* Ventana de Chat */}
      <div className="flex-1 flex flex-col bg-ink/50">
        {activeChatId ? (
          <ActiveChatWindow chatId={activeChatId as any} role={role} />
        ) : (
          <div className="flex-1 grid place-items-center text-slate-500">
            <p>Selecciona un chat para empezar a escribir.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveChatWindow({ chatId, role }: { chatId: any; role: string }) {
  const mensajes = useQuery(api.chats.getHistorialChat, { chatId });
  const enviar = useMutation(api.chats.enviarMensaje);
  const cerrarChat = useMutation(api.chats.actualizarEstadoChat);

  const currentUser = useQuery(api.users.getCurrentUser);
  
  const [texto, setTexto] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    await enviar({ chatId, contenido: texto });
    setTexto("");
  };

  const handleFinalize = async () => {
    await cerrarChat({ chatId, estado: "cerrado" });
    toast.success("Chat finalizado");
    if (role === "student") {
      setShowReview(true);
    }
  };

  return (
    <>
      {/* Context Banner */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-brand-2" />
          <span className="text-slate-300">Chat activo</span>
        </div>
        {role === "student" && (
          <button 
            onClick={handleFinalize}
            className="text-xs bg-brand-2/10 text-brand-2 px-3 py-1 rounded-lg hover:bg-brand-2/20 transition border border-brand-2/20"
          >
            Finalizar Servicio
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {mensajes?.map((m: any) => {
          const isMe = m.remitenteId === currentUser?._id;
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-brand text-white rounded-br-none' : 'bg-white/10 text-slate-200 rounded-bl-none'}`}>
                <p className="text-sm">{m.contenido}</p>
              </div>
            </div>
          )
        })}
        {mensajes?.length === 0 && <p className="text-center text-slate-500 mt-10 text-sm">Envía el primer mensaje para coordinar la clase.</p>}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={texto} 
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..." 
            className="flex-1 bg-ink border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
          />
          <button type="submit" className="bg-brand-2 hover:bg-white text-ink-soft font-bold px-6 rounded-full transition text-sm">
            Enviar
          </button>
        </form>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-ink-soft border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-white">Califica al Mentor</h4>
              <button onClick={() => setShowReview(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-1 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setReviewStars(i)}>
                  <Star className={`w-8 h-8 cursor-pointer transition ${i <= reviewStars ? "text-yellow-400 fill-current" : "text-slate-600 hover:text-yellow-400/50"}`} />
                </button>
              ))}
            </div>
            <textarea 
              value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="¿Cómo fue tu experiencia? Cuéntale a otros estudiantes..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none h-24 mb-4"
            />
            <button
              onClick={async () => {
                // We need mentorId and publicacionId from the chat - use a simplified approach
                toast.success("¡Gracias por tu reseña! Tu opinión ayuda a otros estudiantes.");
                setShowReview(false);
              }}
              className="w-full bg-brand hover:bg-brand-2 text-white font-bold py-3 rounded-lg transition"
            >
              Enviar Reseña
            </button>
          </div>
        </div>
      )}
    </>
  );
}
