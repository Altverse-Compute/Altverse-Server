import Fastify from "fastify";
import rpcPlugin from "@/plugins/rpc";
import envPlugin from "@plugins/env";
import storagePlugin from "@plugins/storage";
import enginePlugin from "@plugins/engine";
import { wsRoutes } from "@routes/websocket";
import dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config();

const app = Fastify({
  logger: process.env.NODE_ENV === "development",
});

console.log(`
   ___   ____                               
  / _ | / / /__  _____ _______ ___   _______
 / __ |/ / __/ |/ / -_) __(_-</ -_) / __(_-<
/_/ |_/_/\\__/|___/\\__/_/ /___/\\__/ /_/ /___/
                                            
`);

(async () => {
  await app.register(envPlugin);
  await app.register(storagePlugin);
  await app.register(rpcPlugin);
  await app.register(enginePlugin);

  await app.register(cors, {
    origin: app.env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    hideOptionsRoute: true,
    hook: "preValidation",
  });

  await app.register(wsRoutes);

  app
    .listen({
      host: "0.0.0.0",
      port: app.env.port,
    })
    .then(console.log);
})();
// const tick = () => {
//   for (const [index, client] of network.wss.clients) {
//     engine.input(index, client.data.input);
//   }
//   network.wss.tick(engine.tick());
//   setTimeout(tick, 1000 / Env.tickRate);
// };
// tick();
