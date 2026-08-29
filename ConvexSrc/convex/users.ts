import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Registro de usuario básico (Alumno)
export const registrarUsuarioBase = mutation({
  args: { 
    nombre: v.string(), 
    apellido: v.string(), 
    email: v.string(),
    avatarUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Validar si el email ya existe
    const existente = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existente) return existente._id;

    const userId = await ctx.db.insert("users", {
      nombre: args.nombre,
      apellido: args.apellido,
      email: args.email,
      avatarUrl: args.avatarUrl,
      rol: "student"
    });
    return userId;
  },
});

// 2. Registro directo de un Mentor (Nuevo requerimiento)
export const registrarMentorDirecto = mutation({
  args: { 
    nombre: v.string(), 
    apellido: v.string(), 
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    dni: v.string(), 
    celular: v.string(), 
    correoPersonal: v.string()
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existente) throw new Error("El email ya está registrado");

    // 1. Creamos al usuario con rol de mentor
    const userId = await ctx.db.insert("users", {
      nombre: args.nombre,
      apellido: args.apellido,
      email: args.email,
      avatarUrl: args.avatarUrl,
      rol: "mentor"
    });

    // 2. Creamos su ficha específica de mentor
    const mentorId = await ctx.db.insert("mentors", {
      userId: userId,
      dni: args.dni,
      celular: args.celular,
      correoPersonal: args.correoPersonal,
      calificacionPromedio: 0,
      numeroDeResenas: 0
    });

    return mentorId;
  },
});

// 3. Mejorar alumno a mentor
export const mejorarAMentor = mutation({
  args: { 
    userId: v.id("users"), 
    dni: v.string(), 
    celular: v.string(), 
    correoPersonal: v.string() 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.rol === "mentor") throw new Error("El usuario ya es mentor");

    // Cambiamos el rol en la tabla users
    await ctx.db.patch(args.userId, { rol: "mentor" });

    // Creamos su perfil en la tabla mentors
    const mentorId = await ctx.db.insert("mentors", {
      userId: args.userId,
      dni: args.dni,
      celular: args.celular,
      correoPersonal: args.correoPersonal,
      calificacionPromedio: 0,
      numeroDeResenas: 0
    });

    return mentorId;
  },
});

// 4. Obtener el perfil base
export const getPerfilPorEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
  }
});
