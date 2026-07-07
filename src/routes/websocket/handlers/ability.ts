import { ClientAbility } from "@proto/game_pb";
import type { FastifyRequest } from "fastify";

export const Ability = (req: FastifyRequest, key: ClientAbility) => {
  if (key === ClientAbility.FIRST) req.input.setFirstAbility(true);
  else req.input.setSecondAbility(true);
};
