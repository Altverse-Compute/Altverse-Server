import { ComputeEngine, EngineProps, type Input, JoinProps } from "./compute";
import { Loader } from "./util/loader.ts";
import { coreEvents } from "./util/events.ts";
import { logger } from "./util/logger.ts";

export class Game {
  engine: ComputeEngine;

  constructor() {
    this.engine = new ComputeEngine(
      new EngineProps(Loader.loadConfig(), Loader.loadWorlds()),
    );

    coreEvents.on("join", ({ name, id }) => {
      const join = new JoinProps(name, id);
      this.engine.join(join);
      logger.info({
        joined: {
          username: name,
          id,
        },
      });
    });

    coreEvents.on("leave", ({ id, username }) => {
      this.engine.leave(id);
      logger.info({
        leave: {
          id,
          username,
        },
      });
    });

    coreEvents.on("message", ({ id, content, username }) => {
      this.engine.chatMessage(content, id);
      logger.info({
        chatMessage: {
          id,
          username,
          content,
        },
      });
    });
  }

  tick() {
    return this.engine.update() as Record<number, Buffer>;
  }

  input(id: number, input: Input) {
    this.engine.input(id, input);
  }
}
