import type { game } from "@proto/js";
import type { FastifyRequest } from "fastify";

export const MousePos = (req: FastifyRequest, pos: game.IClientMousePos) => {
  req.input.setMousePosX(pos!.x!);
  req.input.setMousePosY(pos!.y!);
};
