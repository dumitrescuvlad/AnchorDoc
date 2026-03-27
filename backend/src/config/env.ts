import "dotenv/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  dbPath: process.env.DB_PATH || "./data/anchordoc.sqlite",

  uploadDir: process.env.UPLOAD_DIR || "./uploads",

  maxFileMb: Number(process.env.MAX_FILE_MB || "25"),

  iota: {
    rpcUrl: process.env.IOTA_RPC_URL,
    notarizationPkgId: process.env.IOTA_NOTARIZATION_PKG_ID,
    mnemonic: process.env.IOTA_MNEMONIC,
    explorerBase:
      process.env.IOTA_EXPLORER_BASE || "https://explorer.iota.org/testnet",
    networkName: process.env.IOTA_NETWORK_NAME || "testnet",
    mock: process.env.MOCK_NOTARIZATION === "true",
  },
};
