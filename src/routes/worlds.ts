import type { FastifyInstance } from "fastify";

export const clientWorldsPlugin = (fastify: FastifyInstance) => {
  fastify.route({
    url: "/worlds",
    method: "GET",
    handler(req, res) {
      res.status(200).send(req.server.storage.worldsToSend);
    },
  });
};
