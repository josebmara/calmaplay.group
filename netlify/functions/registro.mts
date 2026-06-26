// netlify/functions/registro.mts
// POST /api/registro  { nombre, apellido?, correo, contrasena, edad? }
// Crea el usuario (con la contraseña ya hasheada), abre una sesión y
// devuelve el token que el navegador debe guardar.

import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { hashPassword, createSession, getPuntosTotales } from "./lib/auth.mts";

const db = getDatabase();

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.nombre || !body.correo || !body.contrasena) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  if (String(body.contrasena).length < 4) {
    return Response.json({ error: "La contraseña debe tener al menos 4 caracteres" }, { status: 400 });
  }

  const correo = String(body.correo).trim().toLowerCase();

  const existentes = await db.sql`SELECT id FROM usuarios WHERE correo = ${correo}`;
  if (existentes.length > 0) {
    return Response.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const hash = await hashPassword(String(body.contrasena));

  const creados = await db.sql`
    INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, edad)
    VALUES (${body.nombre}, ${body.apellido || null}, ${correo}, ${hash}, ${body.edad || null})
    RETURNING id, nombre
  `;
  const usuario = creados[0];

  const token = await createSession(usuario.id);
  const puntos = await getPuntosTotales(usuario.id);

  return Response.json({ token, nombre: usuario.nombre, puntos });
};

export const config: Config = {
  path: "/api/registro",
  method: "POST",
};
