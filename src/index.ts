import { Network } from "./network";
import { Game } from "./game.ts";
import { Env } from "./util/env.ts";
import { logger } from "./util/logger.ts";

logger.info(`
   ___   ____                               
  / _ | / / /__  _____ _______ ___   _______
 / __ |/ / __/ |/ / -_) __(_-</ -_) / __(_-<
/_/ |_/_/\\__/|___/\\__/_/ /___/\\__/ /_/ /___/
                                            
`);

const network = new Network();
const game = new Game();

const tick = () => {
  for (const [index, client] of network.wss.clients) {
    game.input(index, client.data.input);
  }
  network.wss.tick(game.tick());
  setTimeout(tick, 1000 / Env.tickRate);
};
tick();
