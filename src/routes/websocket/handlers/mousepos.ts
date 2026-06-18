import type { FastifyRequest } from "fastify";

export const MousePos = (req: FastifyRequest, pos: [number, number]) => {
  req.input.setMousePosX(pos[0]);
  req.input.setMousePosY(pos[1]);
};
