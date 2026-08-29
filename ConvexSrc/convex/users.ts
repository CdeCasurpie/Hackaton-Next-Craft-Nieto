import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Registro y Roles ---
export const registrarUsuarioBase = mutation({
  args: { nombre: v.string(), apellido: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existente) return existente._id;
    return await ctx.db.insert("users", { ...args, rol: "student" });
  },
});

export const registrarMentorDirecto = mutation({
  args: { 
    nombre: v.string(), apellido: v.string(), email: v.string(), avatarUrl: v.optional(v.string()),
    dni: v.string(), celular: v.string(), correoPersonal: v.string()
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existente) throw new Error("El email ya está registrado");
    const userId = await ctx.db.insert("users", {
      nombre: args.nombre, apellido: args.apellido, email: args.email, avatarUrl: args.avatarUrl, rol: "mentor"
    });
    return await ctx.db.insert("mentors", {
      userId: userId, dni: args.dni, celular: args.celular, correoPersonal: args.correoPersonal, calificacionPromedio: 0, numeroDeResenas: 0
    });
  },
});

export const mejorarAMentor = mutation({
  args: { userId: v.id("users"), dni: v.string(), celular: v.string(), correoPersonal: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.rol === "mentor") throw new Error("El usuario ya es mentor");
    await ctx.db.patch(args.userId, { rol: "mentor" });
    return await ctx.db.insert("mentors", {
      userId: args.userId, dni: args.dni, celular: args.celular, correoPersonal: args.correoPersonal, calificacionPromedio: 0, numeroDeResenas: 0
    });
  },
});

export const getPerfilPorEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
  }
});

// --- Reputación y Reseñas (PENDIENTES IMPLEMENTADOS) ---
export const getPerfilPublicoMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) throw new Error("Mentor no encontrado");
    const user = await ctx.db.get(mentor.userId);
    return { ...mentor, user };
  }
});

export const crearResena = mutation({
  args: { mentorId: v.id("mentors"), studentId: v.id("users"), publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")), puntuacion: v.number(), comentario: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("resenas", { ...args, votosUtiles: 0 });
    // Recalcular promedio de calificación del mentor
    const mentor = await ctx.db.get(args.mentorId);
    if (mentor) {
      const nuevoNumero = mentor.numeroDeResenas + 1;
      const nuevoPromedio = ((mentor.calificacionPromedio * mentor.numeroDeResenas) + args.puntuacion) / nuevoNumero;
      await ctx.db.patch(args.mentorId, { calificacionPromedio: nuevoPromedio, numeroDeResenas: nuevoNumero });
    }
  }
});

export const votarResenaUtil = mutation({
  args: { resenaId: v.id("resenas") },
  handler: async (ctx, args) => {
    const resena = await ctx.db.get(args.resenaId);
    if (resena) {
      await ctx.db.patch(args.resenaId, { votosUtiles: resena.votosUtiles + 1 });
    }
  }
});

export const getResenasDeMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    const resenas = await ctx.db.query("resenas").withIndex("by_mentor", q => q.eq("mentorId", args.mentorId)).collect();
    // Ordenamos por votos útiles, las más útiles primero
    return resenas.sort((a, b) => b.votosUtiles - a.votosUtiles);
  }
});
