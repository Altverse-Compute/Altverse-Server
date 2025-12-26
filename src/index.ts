// import grpc from "@grpc/grpc-js"
// import {loadSync} from "@grpc/proto-loader";
// import * as path from "node:path";
// import type {ProtoGrpcType} from "./proto/generated/ts/rpc.ts";
//
// const protoPath = path.join(__dirname, "./proto/proto/rpc.proto")
//
// const pkg = loadSync(protoPath, {})
//
// const proto = (grpc.loadPackageDefinition(pkg) as any as ProtoGrpcType).connection as any
//
// const client = new proto.GameService('localhost:7030', grpc.credentials.createInsecure())
//
// const metadata = new grpc.Metadata()
// metadata.add("token", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
//
// client.Register({
//     icon: "F",
//     name: "EU 1",
//     url: "localhost:7002"
// }, metadata, (err: any, response: any) => {
//     if (err) {
//         console.error(err)
//     }
//     console.log(response)
// }, {
//     token: ""
// })

import {Network} from "./network";
import {Game} from "./game.ts";
import {Env} from "./service/env.ts";
import {logger} from "./service/logger.ts";


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
        game.input(index, client.getUserData().input);
    }
    network.wss.tick(game.tick());
    setTimeout(tick, 1000 / Env.tickRate);
};
tick();