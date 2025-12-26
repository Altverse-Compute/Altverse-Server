import mitt from "mitt";
import type {Role} from "./types";

type CoreEventsType = {
  join: { id: number; name: string; role: Role };
  leave: { id: number; reason?: string };
  message: { content: string; id: number };
};

export const coreEvents = mitt<CoreEventsType>();
