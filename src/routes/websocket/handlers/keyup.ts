import { game } from "@proto/js";
import type { FastifyRequest } from "fastify";

export const KeyUp = (req: FastifyRequest, key: game.ClientKey) => {
  const input = req.input;
  switch (key) {
    case game.ClientKey.DOWN:
      input.setDown(false);
      break;
    case game.ClientKey.LEFT:
      input.setLeft(false);
      break;
    case game.ClientKey.RIGHT:
      input.setRight(false);
      break;
    case game.ClientKey.UP:
      input.setUp(false);
      break;
    case game.ClientKey.SHIFT:
      input.setShift(false);
      break;
  }
};
