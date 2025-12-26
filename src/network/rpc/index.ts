import type {ProtoGrpcType} from "@proto/ts/rpc.ts";
import grpc from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import path from "path";

export class RPCClient {
  public client: typeof ProtoGrpcType.GameService<ProtoGrpcType>;

  constructor() {
    const protoPath = path.join("./src/proto/proto/rpc.proto");

    const pkg = loadSync(protoPath, {});

    const proto = (grpc.loadPackageDefinition(pkg) as any as ProtoGrpcType)
      .connection as any;

    this.client = new proto.GameService(
      "localhost:7030",
      grpc.credentials.createInsecure(),
    );

    const metadata = new grpc.Metadata();
    metadata.add("token", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  }
}
