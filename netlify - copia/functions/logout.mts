// netlify/functions/logout.mts
// POST /api/logout  (header Authorization: Bearer <token>)
// Borra la sesión en el servidor. El navegador también debe borrar el
// token guardado localmente — eso lo hace el frontend, no esta función.

import type { Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { getBearerToken } from "./lib/auth.mts";

const db = getDatabase();

export default async (req: Request) => {
  const token = getBearerToken(req);
  if (token) {
    await db.sql`DELETE FROM sesiones WHERE token = ${token}`;
  }
  return Response.json({ ok: true });
};

export const config: Config = {
  path: "/api/logout",
  method: "POST",
};
