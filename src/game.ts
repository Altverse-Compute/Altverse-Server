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
      this.engine.join(new JoinProps(name, id));
      logger.info(`Joined: ${name}. Id: ${id}`);
    });

    coreEvents.on("leave", ({ id }) => {
      this.engine.leave(id);
      logger.info(`Leave: ${id}`);
    });

    coreEvents.on("message", ({ id, content }) => {
      this.engine.chatMessage(content, id);
      logger.info(`Leave: ${name}. Id: ${id}`);
    });
  }

  tick() {
    return this.engine.update() as Record<number, Buffer>;
  }

  input(id: number, input: Input) {
    this.engine.input(id, input);
  }
}
