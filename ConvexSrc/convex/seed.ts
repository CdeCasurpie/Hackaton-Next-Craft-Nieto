import { internalMutation } from "./_generated/server";

export const populate = internalMutation({
  handler: async (ctx) => {
    const categories = ["Cálculo", "Física", "Programación", "Diseño", "Idiomas", "Negocios"];

    // 1. Create 15 Students
    const studentIds = [];
    for (let i = 1; i <= 15; i++) {
      const id = await ctx.db.insert("users", {
        name: `Estudiante ${i}`,
        email: `estudiante${i}@example.com`,
        nombre: `Estudiante`,
        apellido: `${i}`,
        rol: "student",
        avatarUrl: `https://i.pravatar.cc/150?u=estudiante${i}`,
      });
      studentIds.push(id);
    }

    // 2. Create 10 Mentors
    const mentorIds = [];
    const mentorUserIds = [];
    for (let i = 1; i <= 10; i++) {
      const userId = await ctx.db.insert("users", {
        name: `Profesor ${i}`,
        email: `profe${i}@example.com`,
        nombre: `Profesor`,
        apellido: `${i}`,
        rol: "mentor",
        avatarUrl: `https://i.pravatar.cc/150?u=profe${i}`,
      });
      mentorUserIds.push(userId);

      const mentorId = await ctx.db.insert("mentors", {
        userId: userId,
        dni: `1234567${i}`,
        correoPersonal: `profe${i}@example.com`,
        celular: `98765432${i}`,
        calificacionPromedio: 4.0 + Math.random(),
        numeroDeResenas: Math.floor(Math.random() * 50) + 5,
        emblema: i % 2 === 0 ? "Top Mentor" : "Nuevo Talento",
      });
      mentorIds.push(mentorId);

      // Create 1-2 announcements for each mentor
      for (let j = 0; j < (i % 2 === 0 ? 2 : 1); j++) {
        await ctx.db.insert("pubAnuncioMentor", {
          mentorId,
          categoria: categories[(i + j) % categories.length],
          titulo: `Clases magistrales de ${categories[(i + j) % categories.length]} con método práctico`,
          descripcionDetallada: "Aprende desde cero hasta nivel avanzado con proyectos reales.",
          metodologia: "Videollamada 1 a 1, resolución de ejercicios en vivo y material de apoyo.",
          precioPorHoraSugerido: 15 + Math.floor(Math.random() * 20),
        });
      }
    }

    // 3. Create 20 Dudas (Publications) and Offers
    for (let i = 0; i < 20; i++) {
      const studentId = studentIds[i % studentIds.length];
      const categoria = categories[i % categories.length];
      const pubId = await ctx.db.insert("pubPuntual", {
        studentId,
        categoria,
        titulo: `Ayuda urgente con tarea de ${categoria} para mañana`,
        descripcion: "No entiendo el último tema de la clase y necesito entregar esto. Pago bien si me explicas paso a paso.",
        precioOfrecido: 10 + Math.floor(Math.random() * 30),
        estado: "abierta",
      });

      // Assign 1 to 3 random offers to each duda
      const numOffers = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numOffers; j++) {
        const mentorId = mentorIds[(i + j) % mentorIds.length];
        await ctx.db.insert("postulaciones", {
          publicacionId: pubId,
          mentorId,
          mensajeCorto: "¡Hola! Soy experto en esto, te puedo ayudar ahora mismo en 30 minutos.",
          precioOfertado: 12 + Math.floor(Math.random() * 20),
          tipoCobro: "fijo_por_trabajo",
          estado: "pendiente",
        });
      }
    }

    // 4. Create Reviews
    for (let i = 0; i < 30; i++) {
      const mentorId = mentorIds[i % mentorIds.length];
      const studentId = studentIds[(i * 3) % studentIds.length];
      await ctx.db.insert("resenas", {
        mentorId,
        studentId,
        publicacionId: studentIds[0] as any, // Mocking publication id
        puntuacion: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comentario: "Excelente profesor, muy paciente y explica muy claro. Recomendadísimo.",
        votosUtiles: Math.floor(Math.random() * 10),
      });
    }

    return "Base de datos poblada masivamente!";
  },
});
