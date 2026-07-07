import { ClientKey } from "@proto/game_pb";
import type { FastifyRequest } from "fastify";

export const KeyDown = (req: FastifyRequest, key: ClientKey) => {
  const input = req.input;

  switch (key) {
    case ClientKey.DOWN:
      input.setDown(true);
      break;
    case ClientKey.LEFT:
      input.setLeft(true);
      break;
    case ClientKey.RIGHT:
      input.setRight(true);
      break;
    case ClientKey.UP:
      input.setUp(true);
      break;
    case ClientKey.SHIFT:
      input.setShift(true);
      break;
  }
};
