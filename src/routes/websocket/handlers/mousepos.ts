import type { ClientMousePos } from "@proto/game_pb";
import type { FastifyRequest } from "fastify";

export const MousePos = (req: FastifyRequest, pos: ClientMousePos) => {
  req.input.setMousePosX(pos!.x!);
  req.input.setMousePosY(pos!.y!);
};
