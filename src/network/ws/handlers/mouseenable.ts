import { type WebSocket } from "uWebSockets.js";
import { type Client } from "..";

export const MouseEnable = (ws: WebSocket<Client>, enable: boolean) => {
  ws.getUserData().input.setMouseEnable(enable);
};
