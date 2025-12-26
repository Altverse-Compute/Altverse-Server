export interface Input {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  mouseEnable?: boolean;
  mousePos?: [number, number];
  shift?: boolean;
  first?: boolean;
  second?: boolean;
}

export type Key = "left" | "right" | "up" | "down";

export interface ClientMessage {
  message?: string;
  keyUp?: Key;
  keyDown?: Key;
  init?: { name: string; session: string; hero: string };
  mouseEnable?: boolean;
  mousePos?: [number, number];
  ability?: string;
}
