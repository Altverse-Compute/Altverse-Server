import { FastifyInstance as FI } from "fastify";
import "@fastify/websocket";
import type { Input } from "@/compute";
import type { Role__Output } from "@proto/ts/game/Role.ts";

declare module "fastify" {
  interface RPCDecoration {
    awardPlayer: (
      id: string,
      vp: number,
      accessory: string,
    ) => Promise<unknown>;
    joinPlayer: (
      token: string,
    ) => Promise<JoinPlayerResponse__Output | undefined>;
  }

  interface EnvDecoration {
    dev: boolean;
    port: number;
    frontendUrl: string;

    tickRate: number;
    storagePath: string;
    worldsPath: string;

    rpcToken: string;
    rpcHost: string;
    rpcPingInterval: number;

    clientCert: string;
    clientKey: string;
    caCert: string;
  }

  export interface Certificates {
    caCrt: Buffer;
    clientKey: Buffer;
    clientCrt: Buffer;
  }

  interface StorageDecoration {
    config: string;
    certs: Certificates;
    worlds: string[];
  }

  interface EngineDecoration {
    join: (name: string, id: number) => void;
    leave: (name: string, id: number) => void;
    chatMessage: (name: string, id: number, content: string) => void;
    tick: () => Record<number, Buffer>;
    input: (id: number, input: Input) => void;
  }

  interface FastifyRequest {
    name: string;
    sid: number;
    accountId: string;
    input: Input;
    role: Role__Output;
  }

  interface WebSocketDecoration {
    clientsCount: number;
  }

  interface FastifyInstance extends FI {
    rpc: RPCDecoration;
    env: EnvDecoration;
    storage: StorageDecoration;
    engine: EngineDecoration;
    ws: WebSocketDecoration;
  }
}
