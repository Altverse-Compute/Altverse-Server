import {type WebSocket} from "uWebSockets.js";
import {type Client} from "..";

export const MousePos = (ws: WebSocket<Client>, pos: [number, number]) => {
    ws.getUserData().input.setMousePosX(pos[0]);
    ws.getUserData().input.setMousePosY(pos[1]);
};