import type { FastifyInstance } from "fastify";
import { ComputeEngine, EngineProps, JoinProps } from "@/compute";
import fp from "fastify-plugin";

const enginePlugin = (fastify: FastifyInstance) => {
  let engine = new ComputeEngine(
    new EngineProps(fastify.storage.config, fastify.storage.worlds),
  );

  fastify.decorate("engine", {
    join: (name, id) => {
      engine.join(new JoinProps(name, id));

      fastify.log.info({
        joined: {
          id,
          name,
        },
      });
    },
    leave: (name, id) => {
      engine.leave(id);
      fastify.log.info({
        leave: {
          id,
          name,
        },
      });
    },
    chatMessage: (name, id, content) => {
      engine.chatMessage(content, id);
      fastify.log.info({
        chatMessage: {
          name,
          id,
          content,
        },
      });
    },
    tick: () => {
      return engine.update() as Record<number, Buffer>;
    },
    input: (id, input) => {
      engine.input(id, input);
    },
  });
};

export default fp(enginePlugin);
