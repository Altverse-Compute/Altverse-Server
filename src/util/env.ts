import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

export const Env = {
  port: Number(getEnv("PORT", "7001")),
  rpcHost: getEnv("GRPC_HOST", "localhost:7030"),
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:7010"),
  devMode: getEnv("DEV_MODE", "true") == "true",
  tickRate: Number(getEnv("TICK_RATE", "60")),
  storagePath: getEnv("STORAGE_PATH", "storage"),
  worldsPath: getEnv("WORLDS_PATH", "worlds"),
  rpcToken: getEnv(
    "GRPC_TOKEN",
    "3a062bbbd9a14770638cb2ba0306d9577f5c0c904ebc48824f1c1a4bb1062eca",
  ),
  selfSignedCertificates: getEnv("SELF_SIGNED_CERTIFICATES", "true") === "true",
  clientKeyCertFileName: getEnv("CLIENT_KEY_PEM", "client-key.pem"),
  clientCertFileName: getEnv("CLIENT_PEM", "client.pem"),
  rootCertFileName: getEnv("ROOT_PEM", "root.pem"),
};
