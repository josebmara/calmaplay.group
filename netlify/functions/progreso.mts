// netlify/functions/progreso.mts
// POST /api/progreso  (header Authorization: Bearer <token>)
//   body: { minijuego_slug: "respiracion" | "memoria" | "encuentra" }
// Registra UN evento de puntos en el historial (progreso_usuario) y
// devuelve el nuevo total. Los puntos por juego vienen de la tabla
// `minijuegos`, nunca del navegador — así nadie puede "regalarse"
// puntos editando el JavaScript del navegador.

import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { getUserByToken, getBearerToken, getPuntosTotales } from "./lib/auth.mts";

const db = getDatabase();

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const usuario = await getUserByToken(token);
  if (!usuario) {
    return Response.json({ error: "Sesión inválida o expirada" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.minijuego_slug) {
    return Response.json({ error: "Falta minijuego_slug" }, { status: 400 });
  }

  const juegos = await db.sql`
    SELECT id, puntos_recompensa FROM minijuegos WHERE slug = ${body.minijuego_slug} AND jugable = TRUE
  `;
  const juego = juegos[0];
  if (!juego) {
    return Response.json({ error: "Minijuego no encontrado o no disponible" }, { status: 404 });
  }

  await db.sql`
    INSERT INTO progreso_usuario (usuario_id, minijuego_id, puntos_obtenidos)
    VALUES (${usuario.id}, ${juego.id}, ${juego.puntos_recompensa})
  `;

  const puntos = await getPuntosTotales(usuario.id);
  return Response.json({ puntos, puntos_ganados: juego.puntos_recompensa });
};

export const config: Config = {
  path: "/api/progreso",
  method: "POST",
};
