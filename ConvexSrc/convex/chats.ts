import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

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
  args: {},
  handler: async (ctx) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) return [];
    const chats = await ctx.db.query("chats").withIndex("by_student", q => q.eq("studentId", studentId)).collect();
    
    // Retornar información rica (del mentor)
    const result = [];
    for (const chat of chats) {
      const mentor = await ctx.db.get(chat.mentorId);
      const mentorUser = mentor ? await ctx.db.get(mentor.userId) : null;
      result.push({ ...chat, mentor, mentorUser });
    }
    return result;
  }
});

// 3. Obtener chats de un Mentor
export const getMisChatsMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    const chats = await ctx.db.query("chats").withIndex("by_mentor", q => q.eq("mentorId", args.mentorId)).collect();
    const result = [];
    for (const chat of chats) {
      const student = await ctx.db.get(chat.studentId);
      result.push({ ...chat, student });
    }
    return result;
  }
});

// 4. Enviar un mensaje
export const enviarMensaje = mutation({
  args: { chatId: v.id("chats"), contenido: v.string() },
  handler: async (ctx, args) => {
    const remitenteId = await auth.getUserId(ctx);
    if (!remitenteId) throw new Error("No autenticado");
    await ctx.db.insert("mensajes", {
      chatId: args.chatId,
      remitenteId: remitenteId,
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
