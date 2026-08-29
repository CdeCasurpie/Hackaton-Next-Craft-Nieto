import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // 1. Usuarios Generales
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom fields
    nombre: v.optional(v.string()),
    apellido: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    rol: v.optional(v.union(v.literal("student"), v.literal("mentor"))),
  }).index("email", ["email"]),

  // 2. Mentores
  mentors: defineTable({
    userId: v.id("users"),
    dni: v.string(),
    correoPersonal: v.string(),
    celular: v.string(),
    calificacionPromedio: v.number(),
    numeroDeResenas: v.number(),
    emblema: v.optional(v.string()), 
  }).index("by_userId", ["userId"]),

  // 3. Publicaciones de Dudas Puntuales
  pubPuntual: defineTable({
    studentId: v.id("users"),
    categoria: v.string(),
    titulo: v.string(),
    descripcion: v.string(),
    precioOfrecido: v.number(),
    fechaLimite: v.optional(v.number()), // NUEVO: Deadline para manejar urgencias (timestamp)
    estado: v.union(v.literal("abierta"), v.literal("en_progreso"), v.literal("resuelta")),
    mentorAsignadoId: v.optional(v.id("mentors")),
  }).index("by_estado", ["estado"])
    .index("by_student", ["studentId"])
    .index("by_fechaLimite", ["fechaLimite"]), // Índice para ordenar por las más urgentes

  // 4. Publicaciones de Solicitud de Mentorías Largas
  pubSolicitudMentoria: defineTable({
    studentId: v.id("users"),
    categoria: v.string(),
    titulo: v.string(),
    descripcion: v.string(),
    precioPorHoraOfrecido: v.number(),
    fechaLimite: v.optional(v.number()), // NUEVO: Fecha máxima para conseguir profesor
    estado: v.union(v.literal("buscando"), v.literal("activa"), v.literal("finalizada")),
    mentorAsignadoId: v.optional(v.id("mentors")),
  }).index("by_estado", ["estado"])
    .index("by_student", ["studentId"]),

  // 5. Anuncios creados por los Profesores
  pubAnuncioMentor: defineTable({
    mentorId: v.id("mentors"),
    categoria: v.string(),
    titulo: v.string(),
    descripcionDetallada: v.string(),
    metodologia: v.string(),
    precioPorHoraSugerido: v.number(),
  }).index("by_mentor", ["mentorId"])
    .index("by_categoria", ["categoria"]),

  // 6. Postulaciones (Ofertas del Mentor al Alumno)
  postulaciones: defineTable({
    publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")),
    mentorId: v.id("mentors"),
    mensajeCorto: v.string(),
    precioOfertado: v.number(), // NUEVO: El precio que propone el profesor
    tipoCobro: v.union(v.literal("fijo_por_trabajo"), v.literal("por_hora")), // NUEVO: Para distinguir la oferta
    estado: v.union(v.literal("pendiente"), v.literal("aceptada"), v.literal("rechazada")),
  }).index("by_publicacion", ["publicacionId"])
    .index("by_mentor", ["mentorId"]),

  // 7. Chats
  chats: defineTable({
    studentId: v.id("users"),
    mentorId: v.id("mentors"),
    origenId: v.union(v.id("pubSolicitudMentoria"), v.id("pubAnuncioMentor"), v.id("pubPuntual")),
    tipo: v.string(), 
    estado: v.union(v.literal("abierto"), v.literal("cerrado"), v.literal("reabierto")),
  }).index("by_student", ["studentId"])
    .index("by_mentor", ["mentorId"]),

  // 8. Mensajes dentro del chat
  mensajes: defineTable({
    chatId: v.id("chats"),
    remitenteId: v.id("users"),
    contenido: v.string(),
  }).index("by_chat", ["chatId"]),

  // 9. Reseñas
  resenas: defineTable({
    mentorId: v.id("mentors"),
    studentId: v.id("users"),
    publicacionId: v.union(v.id("pubPuntual"), v.id("pubSolicitudMentoria")),
    puntuacion: v.number(), 
    comentario: v.string(),
    votosUtiles: v.number(), // NUEVO: Para rankear la reseña por importancia
  }).index("by_mentor", ["mentorId"])
    .index("by_votosUtiles", ["votosUtiles"]), // Índice para traer siempre las mejores reseñas primero
});
