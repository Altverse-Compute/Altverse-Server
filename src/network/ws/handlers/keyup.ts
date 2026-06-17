import { type Client } from "..";

export const KeyUp = (ws: Bun.ServerWebSocket<Client>, key: string) => {
  const accessedKeys = ["left", "right", "up", "down", "shift"];
  const input = ws.data.input;
  if (accessedKeys.includes(key)) {
    switch (key) {
      case "down":
        input.setDown(false);
        break;
      case "left":
        input.setLeft(false);
        break;
      case "right":
        input.setRight(false);
        break;
      case "up":
        input.setUp(false);
        break;
      case "shift":
        input.setShift(false);
        break;
    }
  }
};
