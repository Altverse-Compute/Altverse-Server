import { game } from "@proto/js";
import type { FastifyRequest } from "fastify";

export const KeyDown = (req: FastifyRequest, key: game.ClientKey) => {
  const input = req.input;
  switch (key) {
    case game.ClientKey.DOWN:
      input.setDown(true);
      break;
    case game.ClientKey.LEFT:
      input.setLeft(true);
      break;
    case game.ClientKey.RIGHT:
      input.setRight(true);
      break;
    case game.ClientKey.UP:
      input.setUp(true);
      break;
    case game.ClientKey.SHIFT:
      input.setShift(true);
      break;
  }
};
