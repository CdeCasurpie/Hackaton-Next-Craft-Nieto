import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Crear Chat Interno (Llamado automáticamente desde publications.ts)
export const crearChat = internalMutation({
  args: {
    studentId: v.id("users"),
    mentorId: v.id("mentors"),
    origenId: v.union(v.id("pubSolicitudMentoria"), v.id("pubAnuncioMentor"), v.id("pubPuntual")),
    tipo: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chats", {
      studentId: args.studentId,
      mentorId: args.mentorId,
      origenId: args.origenId,
      tipo: args.tipo,
      estado: "abierto"
    });
  }
});

// 2. Obtener chats de un Alumno
export const getMisChatsAlumno = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("chats").withIndex("by_student", q => q.eq("studentId", args.studentId)).collect();
  }
});

// 3. Obtener chats de un Mentor
export const getMisChatsMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    return await ctx.db.query("chats").withIndex("by_mentor", q => q.eq("mentorId", args.mentorId)).collect();
  }
});

// 4. Enviar un mensaje
export const enviarMensaje = mutation({
  args: { chatId: v.id("chats"), remitenteId: v.id("users"), contenido: v.string() },
  handler: async (ctx, args) => {
    // Aquí se podría validar que el remitente sea parte del chat
    await ctx.db.insert("mensajes", {
      chatId: args.chatId,
      remitenteId: args.remitenteId,
      contenido: args.contenido
    });
  }
});

// 5. Historial en tiempo real de un chat
export const getHistorialChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db.query("mensajes").withIndex("by_chat", q => q.eq("chatId", args.chatId)).collect();
  }
});

// 6. Cambiar el estado del chat (Cerrarlo al terminar)
export const actualizarEstadoChat = mutation({
  args: { chatId: v.id("chats"), estado: v.union(v.literal("abierto"), v.literal("cerrado"), v.literal("reabierto")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, { estado: args.estado });
  }
});
