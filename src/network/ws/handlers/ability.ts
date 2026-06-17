import type { Client } from "..";

export const Ability = (ws: Bun.ServerWebSocket<Client>, key: string) => {
  const accessedKeys = ["first", "second"];
  const client = ws.data;
  if (accessedKeys.includes(key)) {
    if (key === "first") client.input.setFirstAbility(true);
    else client.input.setSecondAbility(true);
  }
};
