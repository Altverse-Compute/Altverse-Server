import { game } from "@proto/js";
import type { FastifyRequest } from "fastify";

export const Ability = (req: FastifyRequest, key: game.ClientAbility) => {
  if (key === game.ClientAbility.FIRST) req.input.setFirstAbility(true);
  else req.input.setSecondAbility(true);
};
