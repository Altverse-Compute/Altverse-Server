import type { FastifyRequest } from "fastify";

export const Ability = (req: FastifyRequest, key: string) => {
  const accessedKeys = ["first", "second"];
  if (accessedKeys.includes(key)) {
    if (key === "first") req.input.setFirstAbility(true);
    else req.input.setSecondAbility(true);
  }
};
