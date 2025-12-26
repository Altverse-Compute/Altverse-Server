import {ComputeEngine, EngineProps, type Input, JoinProps} from "./compute";
import {Loader} from "./service/loader.ts";
import {coreEvents} from "./service/events.ts";

export class Game {
  engine: ComputeEngine;

  constructor() {
    this.engine = new ComputeEngine(
      new EngineProps(Loader.loadConfig(), Loader.loadWorlds()),
    );

    coreEvents.on("join", ({ name, id }) => {
      this.engine.join(new JoinProps(name, id));
    });

    coreEvents.on("leave", ({ id }) => {
      this.engine.leave(id);
    });

    coreEvents.on("message", ({id, content}) => {
      this.engine.chatMessage(content, id)
    })
  }

  tick() {
    return this.engine.update() as Record<number, Buffer>;
  }

  input(id: number, input: Input) {
    this.engine.input(id, input);
  }
}
