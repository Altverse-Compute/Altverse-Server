import { type Client } from "..";

export const MouseEnable = (
  ws: Bun.ServerWebSocket<Client>,
  enable: boolean,
) => {
  ws.data.input.setMouseEnable(enable);
};
