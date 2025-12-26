import {App} from "uWebSockets.js"
import {WebSocketServer} from "./ws";
import {Env} from "../service/env.ts";
import {logger} from "../service/logger.ts";

export class Network {
    wss: WebSocketServer

    constructor() {
        // @ts-ignore
        const app = new App()
        this.wss = new WebSocketServer(app)
        app.listen(Env.port, () => {
            logger.info("Server started at port " + Env.port);
        })
    }
}