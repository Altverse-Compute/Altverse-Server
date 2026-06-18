import type { FastifyRequest } from "fastify";

export const MouseEnable = (req: FastifyRequest, enable: boolean) => {
  req.input.setMouseEnable(enable);
};
