/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("Debe registrar un usuario base (estudiante)", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  
  const userId = await t.mutation(api.users.registrarUsuarioBase, {
    nombre: "Cesar",
    apellido: "Nieto",
    email: "cesar@test.com"
  });

  expect(userId).toBeDefined();
  expect(userId).not.toBeNull();

  // Validamos con un Query que el usuario se creó correctamente
  const user = await t.query(api.users.getPerfilPorEmail, { email: "cesar@test.com" });
  expect(user).not.toBeNull();
  expect(user?.nombre).toBe("Cesar");
  expect(user?.rol).toBe("student");
});

test("Debe registrar un mentor directamente", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  
  const mentorId = await t.mutation(api.users.registrarMentorDirecto, {
    nombre: "Profe",
    apellido: "Mauri",
    email: "profe@test.com",
    dni: "12345678",
    celular: "999888777",
    correoPersonal: "personal@test.com"
  });

  expect(mentorId).toBeDefined();
  expect(mentorId).not.toBeNull();

  // Validamos que el rol del usuario base sea 'mentor'
  const user = await t.query(api.users.getPerfilPorEmail, { email: "profe@test.com" });
  expect(user).not.toBeNull();
  expect(user?.rol).toBe("mentor");
});

test("Debe mejorar a un estudiante existente a mentor", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  
  // 1. Creamos un estudiante primero
  const userId = await t.mutation(api.users.registrarUsuarioBase, {
    nombre: "Alumno",
    apellido: "Curioso",
    email: "alumno@test.com"
  });
  
  // 2. Lo mejoramos a mentor
  const mentorId = await t.mutation(api.users.mejorarAMentor, {
    userId: userId!,
    dni: "87654321",
    celular: "900000000",
    correoPersonal: "alumno.profe@test.com"
  });

  expect(mentorId).toBeDefined();
  expect(mentorId).not.toBeNull();

  // 3. Verificamos que su rol haya cambiado
  const user = await t.query(api.users.getPerfilPorEmail, { email: "alumno@test.com" });
  expect(user?.rol).toBe("mentor");
});
