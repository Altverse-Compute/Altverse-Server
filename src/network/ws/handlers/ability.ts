import type { WebSocket } from "uWebSockets.js";
import type { Client } from "..";

export const Ability = (ws: WebSocket<Client>, key: string) => {
  const accessedKeys = ["first", "second"];
  const client = ws.getUserData();
  if (accessedKeys.includes(key)) {
    if (key === "first") client.input.setFirstAbility(true);
    else client.input.setSecondAbility(true);
  }
};
