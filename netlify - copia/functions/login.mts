// netlify/functions/login.mts
// POST /api/login  { correo, contrasena }
// Verifica las credenciales contra el hash guardado y abre una sesión.

import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { verifyPassword, createSession, getPuntosTotales } from "./lib/auth.mts";

const db = getDatabase();

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.correo || !body.contrasena) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const correo = String(body.correo).trim().toLowerCase();
  const filas = await db.sql`
    SELECT id, nombre, contrasena_hash FROM usuarios WHERE correo = ${correo}
  `;
  const usuario = filas[0];

  if (!usuario || !(await verifyPassword(String(body.contrasena), usuario.contrasena_hash))) {
    return Response.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createSession(usuario.id);
  const puntos = await getPuntosTotales(usuario.id);

  return Response.json({ token, nombre: usuario.nombre, puntos });
};

export const config: Config = {
  path: "/api/login",
  method: "POST",
};
