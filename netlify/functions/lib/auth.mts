// netlify/functions/lib/auth.mts
// Funciones compartidas: hashear contraseñas, crear/verificar sesiones
// y calcular el total de puntos de un usuario sumando su historial.
// Las importan register.mts, login.mts, perfil.mts, progreso.mts y
// recompensas.mts — no es una función en sí misma (no tiene `export
// default`), así que Netlify no la publica como endpoint.

import bcrypt from "bcryptjs";
import { getDatabase } from "@netlify/database";

const db = getDatabase();
const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export async function hashPassword(plano: string): Promise<string> {
  return bcrypt.hash(plano, 10);
}

export async function verifyPassword(plano: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plano, hash);
}

export async function createSession(usuarioId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS).toISOString();

  await db.sql`
    INSERT INTO sesiones (usuario_id, token, expira_en)
    VALUES (${usuarioId}, ${token}, ${expiraEn})
  `;

  return token;
}

export async function getUserByToken(token: string) {
  const rows = await db.sql`
    SELECT u.id, u.nombre, u.correo
    FROM sesiones s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token = ${token} AND s.expira_en > NOW()
  `;
  return rows[0] || null;
}

export async function getPuntosTotales(usuarioId: number): Promise<number> {
  const rows = await db.sql<{ total: number }>`
    SELECT COALESCE(SUM(puntos_obtenidos), 0) AS total
    FROM progreso_usuario
    WHERE usuario_id = ${usuarioId}
  `;
  return Number(rows[0].total);
}

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}
