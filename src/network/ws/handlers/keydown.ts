import { type WebSocket } from "uWebSockets.js";
import { type Client } from "..";

export const KeyDown = (ws: WebSocket<Client>, key: string) => {
  const accessedKeys = ["left", "right", "up", "down", "shift"];
  const input = ws.getUserData().input;
  if (accessedKeys.includes(key)) {
    switch (key) {
      case "down":
        input.setDown(true);
        break;
      case "left":
        input.setLeft(true);
        break;
      case "right":
        input.setRight(true);
        break;
      case "up":
        input.setUp(true);
        break;
      case "shift":
        input.setShift(true);
        break;
    }
  }
};
