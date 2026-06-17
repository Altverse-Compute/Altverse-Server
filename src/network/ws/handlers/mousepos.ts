import { type Client } from "..";

export const MousePos = (
  ws: Bun.ServerWebSocket<Client>,
  pos: [number, number],
) => {
  ws.data.input.setMousePosX(pos[0]);
  ws.data.input.setMousePosY(pos[1]);
};
