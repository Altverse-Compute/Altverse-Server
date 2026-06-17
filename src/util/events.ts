import mitt from "mitt";
import type { Role__Output } from "@proto/ts/game/Role.ts";

type CoreEventsType = {
  join: { id: number; name: string; role: Role__Output };
  leave: { id: number; username: string; reason?: string };
  message: { content: string; id: number; username: string };
};

export const coreEvents = mitt<CoreEventsType>();
