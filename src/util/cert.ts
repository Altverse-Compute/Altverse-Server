import * as fs from "node:fs";
import { Env } from "./env.ts";

interface Certificates {
  client: Buffer;
  clientKey: Buffer;
  root: Buffer;
}

export default function loadCertificate(): Certificates {
  return {
    client: fs.readFileSync(Env.clientCertFileName),
    clientKey: fs.readFileSync(Env.clientKeyCertFileName),
    root: fs.readFileSync(Env.rootCertFileName),
  };
}
