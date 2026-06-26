// netlify/functions/perfil.mts
// GET /api/perfil  (header Authorization: Bearer <token>)
// El frontend llama esto al cargar la página para "recordar" que ya
// habías iniciado sesión, sin pedirte la contraseña otra vez.

import type { Config } from "@netlify/functions";
import { getUserByToken, getPuntosTotales, getBearerToken } from "./lib/auth.mts";

export default async (req: Request) => {
  const token = getBearerToken(req);
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const usuario = await getUserByToken(token);
  if (!usuario) {
    return Response.json({ error: "Sesión inválida o expirada" }, { status: 401 });
  }

  const puntos = await getPuntosTotales(usuario.id);
  return Response.json({ nombre: usuario.nombre, puntos });
};

export const config: Config = {
  path: "/api/perfil",
  method: "GET",
};
