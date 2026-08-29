import { internalMutation } from "./_generated/server";

export const populate = internalMutation({
  handler: async (ctx) => {
    // 1. Create a Student
    const studentId = await ctx.db.insert("users", {
      name: "Carlos Estudiante",
      email: "carlos@example.com",
      nombre: "Carlos",
      apellido: "Estudiante",
      rol: "student",
      avatarUrl: "https://i.pravatar.cc/150?u=carlos",
    });

    // 2. Create a Mentor (User)
    const mentorUserId = await ctx.db.insert("users", {
      name: "Laura Profesora",
      email: "laura@example.com",
      nombre: "Laura",
      apellido: "Profesora",
      rol: "mentor",
      avatarUrl: "https://i.pravatar.cc/150?u=laura",
    });

    // 3. Create Mentor Profile
    const mentorId = await ctx.db.insert("mentors", {
      userId: mentorUserId,
      dni: "12345678",
      correoPersonal: "laura@example.com",
      celular: "987654321",
      calificacionPromedio: 4.8,
      numeroDeResenas: 12,
      emblema: "Experta en Programación",
    });

    // 4. Create an Anuncio (Mentor Service) in Programación
    await ctx.db.insert("pubAnuncioMentor", {
      mentorId,
      categoria: "Programación",
      titulo: "Tutorías de React y Node.js para Hackatones",
      descripcionDetallada: "Te ayudo a estructurar tu proyecto, resolver bugs y entender hooks avanzados.",
      metodologia: "100% práctico. Revisamos tu código juntos en videollamada y programamos en pareja.",
      precioPorHoraSugerido: 25,
    });

    // 5. Create a Duda Puntual from the student
    await ctx.db.insert("pubPuntual", {
      studentId,
      categoria: "Programación",
      titulo: "Error al desplegar en GitHub Pages con Vite",
      descripcion: "Mi página me da un error 404 en las imágenes. Necesito alguien que me ayude a configurar las rutas de vite.config.ts rápido.",
      precioOfrecido: 15,
      estado: "abierta",
    });

    return "Base de datos poblada exitosamente!";
  },
});
