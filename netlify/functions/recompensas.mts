// netlify/functions/recompensas.mts
// GET /api/recompensas  (header Authorization opcional)
// Devuelve el catálogo completo de recompensas. Si viene un token
// válido, marca cuáles ya desbloqueó ese usuario según su total de
// puntos. Sin token, las devuelve todas como bloqueadas (modo invitado).

import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { getUserByToken, getBearerToken, getPuntosTotales } from "./lib/auth.mts";

const db = getDatabase();

export default async (req: Request) => {
  const catalogo = await db.sql`
    SELECT id, nombre, descripcion, puntos_necesarios, icono
    FROM recompensas
    ORDER BY puntos_necesarios ASC
  `;

  let puntos = 0;
  const token = getBearerToken(req);
  if (token) {
    const usuario = await getUserByToken(token);
    if (usuario) puntos = await getPuntosTotales(usuario.id);
  }

  const recompensas = catalogo.map((r) => ({
    ...r,
    desbloqueada: puntos >= r.puntos_necesarios,
  }));

  return Response.json({ puntos, recompensas });
};

export const config: Config = {
  path: "/api/recompensas",
  method: "GET",
};
