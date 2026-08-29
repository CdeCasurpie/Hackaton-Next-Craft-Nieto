import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { auth } from "./auth";

// =====================================
// REGEX para filtrar datos de contacto
// =====================================
const PHONE_REGEX = /(\+?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}|\d{8,})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const WHATSAPP_REGEX = /whatsapp|wa\.me|whatsa?p/gi;

function sanitizeContactInfo(text: string): string {
  let sanitized = text;
  sanitized = sanitized.replace(PHONE_REGEX, "[Número oculto por seguridad]");
  sanitized = sanitized.replace(EMAIL_REGEX, "[Correo oculto - usa el chat]");
  sanitized = sanitized.replace(WHATSAPP_REGEX, "[Enlace oculto por seguridad]");
  return sanitized;
}

// =====================================
// 1. DUDAS PUNTUALES
// =====================================
export const crearDudaPuntual = mutation({
  args: {
    categoria: v.string(),
    titulo: v.string(),
    descripcion: v.string(),
    precioOfrecido: v.number(),
    fechaLimite: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) throw new Error("No autenticado");
    return await ctx.db.insert("pubPuntual", {
      ...args,
      descripcion: sanitizeContactInfo(args.descripcion),
      titulo: sanitizeContactInfo(args.titulo),
      studentId,
      estado: "abierta",
    });
  },
});

export const getDudasAbiertas = query({
  args: {},
  handler: async (ctx) => {
    const dudas = await ctx.db
      .query("pubPuntual")
      .withIndex("by_estado", (q) => q.eq("estado", "abierta"))
      .collect();
    const result = [];
    for (const d of dudas) {
      const student = await ctx.db.get(d.studentId);
      result.push({ ...d, student });
    }
    return result;
  },
});

export const getMisDudas = query({
  args: {},
  handler: async (ctx) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) return [];
    return await ctx.db
      .query("pubPuntual")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
  },
});

export const marcarPublicacionResuelta = mutation({
  args: { publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")) },
  handler: async (ctx, args) => {
    const pub = await ctx.db.get(args.publicacionId);
    if (!pub) throw new Error("Publicación no encontrada");
    // Determine if pubPuntual or pubSolicitudMentoria by checking fields
    if ("precioOfrecido" in pub) {
      await ctx.db.patch(args.publicacionId as any, { estado: "resuelta" });
    } else {
      await ctx.db.patch(args.publicacionId as any, { estado: "finalizada" });
    }
  },
});

// =====================================
// 2. SOLICITUDES DE MENTORÍA LARGA
// =====================================
export const crearSolicitudMentoria = mutation({
  args: {
    categoria: v.string(),
    titulo: v.string(),
    descripcion: v.string(),
    precioPorHoraOfrecido: v.number(),
    fechaLimite: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) throw new Error("No autenticado");
    return await ctx.db.insert("pubSolicitudMentoria", {
      ...args,
      descripcion: sanitizeContactInfo(args.descripcion),
      titulo: sanitizeContactInfo(args.titulo),
      studentId,
      estado: "buscando",
    });
  },
});

export const getSolicitudesMentoriaAbiertas = query({
  args: {},
  handler: async (ctx) => {
    const solicitudes = await ctx.db
      .query("pubSolicitudMentoria")
      .withIndex("by_estado", (q) => q.eq("estado", "buscando"))
      .collect();
    const result = [];
    for (const s of solicitudes) {
      const student = await ctx.db.get(s.studentId);
      result.push({ ...s, student });
    }
    return result;
  },
});

export const getMisSolicitudesMentoria = query({
  args: {},
  handler: async (ctx) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) return [];
    return await ctx.db
      .query("pubSolicitudMentoria")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
  },
});

// =====================================
// 3. ANUNCIOS DEL MENTOR
// =====================================
export const publicarAnuncioMentor = mutation({
  args: {
    mentorId: v.id("mentors"),
    categoria: v.string(),
    titulo: v.string(),
    descripcionDetallada: v.string(),
    metodologia: v.string(),
    precioPorHoraSugerido: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pubAnuncioMentor", {
      ...args,
      titulo: sanitizeContactInfo(args.titulo),
      descripcionDetallada: sanitizeContactInfo(args.descripcionDetallada),
      metodologia: sanitizeContactInfo(args.metodologia),
    });
  },
});

export const getMisAnunciosMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pubAnuncioMentor")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getAnunciosMentores = query({
  args: { categoria: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let anuncios;
    if (args.categoria) {
      anuncios = await ctx.db
        .query("pubAnuncioMentor")
        .withIndex("by_categoria", (q) => q.eq("categoria", args.categoria!))
        .collect();
    } else {
      anuncios = await ctx.db.query("pubAnuncioMentor").collect();
    }
    // Enrich with mentor + user data
    const result = [];
    for (const a of anuncios) {
      const mentor = await ctx.db.get(a.mentorId);
      let user = null;
      if (mentor) user = await ctx.db.get(mentor.userId);
      result.push({ ...a, mentor, user });
    }
    return result;
  },
});

export const eliminarAnuncioMentor = mutation({
  args: { anuncioId: v.id("pubAnuncioMentor") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.anuncioId);
  },
});

// =====================================
// 4. POSTULACIONES Y OFERTAS
// =====================================
export const postularADuda = mutation({
  args: {
    publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")),
    mentorId: v.id("mentors"),
    mensajeCorto: v.string(),
    precioOfertado: v.number(),
    tipoCobro: v.union(v.literal("fijo_por_trabajo"), v.literal("por_hora")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("postulaciones", {
      ...args,
      mensajeCorto: sanitizeContactInfo(args.mensajeCorto),
      estado: "pendiente",
    });
  },
});

export const getOfertasDePublicacion = query({
  args: { publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")) },
  handler: async (ctx, args) => {
    const ofertas = await ctx.db
      .query("postulaciones")
      .withIndex("by_publicacion", (q) => q.eq("publicacionId", args.publicacionId))
      .collect();
    const result = [];
    for (const o of ofertas) {
      const mentor = await ctx.db.get(o.mentorId);
      let user = null;
      if (mentor) user = await ctx.db.get(mentor.userId);
      result.push({ ...o, mentor, user });
    }
    return result;
  },
});

export const getTodasMisOfertas = query({
  args: {},
  handler: async (ctx) => {
    const studentId = await auth.getUserId(ctx);
    if (!studentId) return [];
    // Get all student's publications (puntuales + mentorias)
    const puntuales = await ctx.db
      .query("pubPuntual")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    const mentorias = await ctx.db
      .query("pubSolicitudMentoria")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    const allPubs = [...puntuales, ...mentorias];
    // Get all offers for all publications
    const allOfertas = [];
    for (const pub of allPubs) {
      const ofertas = await ctx.db
        .query("postulaciones")
        .withIndex("by_publicacion", (q) => q.eq("publicacionId", pub._id))
        .collect();
      for (const o of ofertas) {
        const mentor = await ctx.db.get(o.mentorId);
        let user = null;
        if (mentor) user = await ctx.db.get(mentor.userId);
        allOfertas.push({ ...o, mentor, user, publicacion: pub });
      }
    }
    return allOfertas;
  },
});

export const getMisPostulaciones = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("postulaciones")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

// =====================================
// 5. ACEPTAR / RECHAZAR OFERTA
// =====================================
export const aceptarOferta = mutation({
  args: { postulacionId: v.id("postulaciones") },
  handler: async (ctx, args) => {
    const postulacion = await ctx.db.get(args.postulacionId);
    if (!postulacion) throw new Error("La oferta no existe");

    await ctx.db.patch(args.postulacionId, { estado: "aceptada" });

    const pubCualquiera = await ctx.db.get(postulacion.publicacionId as any);
    if (!pubCualquiera) return;

    let studentId = (pubCualquiera as any).studentId;
    let tipoChat = "duda_puntual";

    if ((pubCualquiera as any).precioOfrecido !== undefined) {
      await ctx.db.patch(postulacion.publicacionId as any, {
        estado: "en_progreso",
        mentorAsignadoId: postulacion.mentorId,
      });
    } else {
      await ctx.db.patch(postulacion.publicacionId as any, {
        estado: "activa",
        mentorAsignadoId: postulacion.mentorId,
      });
      tipoChat = "mentoria_larga";
    }

    if (studentId) {
      await ctx.runMutation(internal.chats.crearChat, {
        studentId: studentId,
        mentorId: postulacion.mentorId,
        origenId: postulacion.publicacionId as any,
        tipo: tipoChat,
      });
    }
  },
});

export const rechazarOferta = mutation({
  args: { postulacionId: v.id("postulaciones") },
  handler: async (ctx, args) => {
    const postulacion = await ctx.db.get(args.postulacionId);
    if (!postulacion) throw new Error("La oferta no existe");
    await ctx.db.patch(args.postulacionId, { estado: "rechazada" });
  },
});
