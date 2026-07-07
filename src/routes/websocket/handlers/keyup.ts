import { ClientKey } from "@proto/game_pb";
import type { FastifyRequest } from "fastify";

export const KeyUp = (req: FastifyRequest, key: ClientKey) => {
  const input = req.input;
  switch (key) {
    case ClientKey.DOWN:
      input.setDown(false);
      break;
    case ClientKey.LEFT:
      input.setLeft(false);
      break;
    case ClientKey.RIGHT:
      input.setRight(false);
      break;
    case ClientKey.UP:
      input.setUp(false);
      break;
    case ClientKey.SHIFT:
      input.setShift(false);
      break;
  }
};
