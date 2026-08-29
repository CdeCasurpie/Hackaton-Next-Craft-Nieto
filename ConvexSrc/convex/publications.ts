import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// 1. Duda Puntual
export const crearDudaPuntual = mutation({
  args: { studentId: v.id("users"), categoria: v.string(), titulo: v.string(), descripcion: v.string(), precioOfrecido: v.number(), fechaLimite: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pubPuntual", { ...args, estado: "abierta" });
  }
});

// 2. Solicitud de Mentoría Larga (PENDIENTE IMPLEMENTADO)
export const crearSolicitudMentoria = mutation({
  args: { studentId: v.id("users"), categoria: v.string(), titulo: v.string(), descripcion: v.string(), precioPorHoraOfrecido: v.number(), fechaLimite: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pubSolicitudMentoria", { ...args, estado: "buscando" });
  }
});

// 3. Anuncio del Mentor (PENDIENTE IMPLEMENTADO)
export const publicarAnuncioMentor = mutation({
  args: { mentorId: v.id("mentors"), categoria: v.string(), titulo: v.string(), descripcionDetallada: v.string(), metodologia: v.string(), precioPorHoraSugerido: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pubAnuncioMentor", args);
  }
});

// 4. Leer dudas
export const getDudasAbiertas = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pubPuntual").withIndex("by_estado", q => q.eq("estado", "abierta")).collect();
  }
});

// 5. Postulación y Ofertas
export const postularADuda = mutation({
  args: { publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")), mentorId: v.id("mentors"), mensajeCorto: v.string(), precioOfertado: v.number(), tipoCobro: v.union(v.literal("fijo_por_trabajo"), v.literal("por_hora")) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("postulaciones", { ...args, estado: "pendiente" });
  }
});

export const getOfertasDePublicacion = query({
  args: { publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("postulaciones").withIndex("by_publicacion", q => q.eq("publicacionId", args.publicacionId)).collect();
  }
});

// 6. Aceptar Oferta (Ahora llama al chat)
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
      await ctx.db.patch(postulacion.publicacionId as any, { estado: "en_progreso", mentorAsignadoId: postulacion.mentorId });
    } else {
      await ctx.db.patch(postulacion.publicacionId as any, { estado: "activa", mentorAsignadoId: postulacion.mentorId });
      tipoChat = "mentoria_larga";
    }

    // PENDIENTE IMPLEMENTADO: Gatillar la creación del chat automáticamente (Internal Mutation)
    if (studentId) {
      await ctx.runMutation(internal.chats.crearChat, {
        studentId: studentId,
        mentorId: postulacion.mentorId,
        origenId: postulacion.publicacionId as any,
        tipo: tipoChat
      });
    }
  }
});
