// @ts-nocheck
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const getModules = () => import.meta.glob("./**/*.*s");

test("Flujo completo: Alumno publica duda, Mentor hace oferta y Alumno acepta", async () => {
  const t = convexTest(schema, getModules());
  
  // 1. SETUP: Creamos usuario alumno y usuario mentor usando las funciones que ya hicimos
  const studentId = await t.mutation(api.users.registrarUsuarioBase, {
    nombre: "Alumno", apellido: "Test", email: "alumno2@test.com"
  });
  
  const mentorId = await t.mutation(api.users.registrarMentorDirecto, {
    nombre: "Profe", apellido: "Física", email: "profe2@test.com",
    dni: "000", celular: "111", correoPersonal: "p@test.com"
  });

  // 2. Alumno crea una publicación puntual
  const dudaId = await t.mutation(api.publications.crearDudaPuntual, {
    studentId: studentId!,
    categoria: "Física",
    titulo: "Leyes de Newton",
    descripcion: "No entiendo la inercia",
    precioOfrecido: 10,
    fechaLimite: Date.now() + 3600000 // Expira en 1 hora
  });
  expect(dudaId).toBeDefined();

  // 3. Verificamos que la duda esté visible y abierta
  const abiertas = await t.query(api.publications.getDudasAbiertas, {});
  expect(abiertas.length).toBe(1);
  expect(abiertas[0]._id).toBe(dudaId);

  // 4. El Mentor hace su oferta
  const postulacionId = await t.mutation(api.publications.postularADuda, {
    publicacionId: dudaId,
    mentorId: mentorId!,
    mensajeCorto: "Yo te lo explico fácil en 20 minutos",
    precioOfertado: 12,
    tipoCobro: "fijo_por_trabajo"
  });
  expect(postulacionId).toBeDefined();

  // 5. El Alumno acepta la oferta
  await t.mutation(api.publications.aceptarOferta, {
    postulacionId: postulacionId,
  });

  // 6. Verificamos que la duda YA NO está abierta (pasó a 'en_progreso')
  const abiertasPost = await t.query(api.publications.getDudasAbiertas, {});
  expect(abiertasPost.length).toBe(0);
});
