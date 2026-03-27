import { randomUUID } from "node:crypto";

import { IotaClient } from "@iota/iota-sdk/client";
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import {
  NotarizationClient,
  NotarizationClientReadOnly,
  TimeLock,
} from "@iota/notarization/node/index.js";
import { Ed25519KeypairSigner } from "@iota/iota-interaction-ts/node/test_utils/index.js";

import { env } from "../config/env.js";

export type NotarizeInput = {
  sha256Hex: string;
  description: string;
  updatableMetadata?: string;
  deleteLockDays?: number;
};

export type NotarizeOutput = {
  objectId: string;
  txDigest: string;
  notarizedAtIso: string;
  explorerUrl: string;
};

function requireIotaEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}


function mockNotarization(_input: NotarizeInput): NotarizeOutput {
  const explorerBase = env.iota.explorerBase;

  const fakeTx = "0x" + randomUUID().replace(/-/g, "");
  const fakeObj = "0x" + randomUUID().replace(/-/g, "");
  const nowIso = new Date().toISOString();

  return {
    objectId: fakeObj,
    txDigest: fakeTx,
    notarizedAtIso: nowIso,
    explorerUrl: `${explorerBase}/transaction/${fakeTx}`,
  };
}

export async function getNotarizationClient(): Promise<NotarizationClient> {
  const rpcUrl = requireIotaEnvValue(env.iota.rpcUrl, "IOTA_RPC_URL");
  const pkgId = requireIotaEnvValue(
    env.iota.notarizationPkgId,
    "IOTA_NOTARIZATION_PKG_ID",
  );
  const mnemonic = requireIotaEnvValue(env.iota.mnemonic, "IOTA_MNEMONIC");

  const iotaClient = new IotaClient({ url: rpcUrl });

  const readOnly = await NotarizationClientReadOnly.createWithPkgId(
    iotaClient,
    pkgId,
  );

  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
  const signer = new Ed25519KeypairSigner(keypair);

  const client = await NotarizationClient.create(readOnly, signer);

  return client;
}

export async function notarizeLocked(
  input: NotarizeInput,
): Promise<NotarizeOutput> {
 
  if (env.iota.mock) {
    return mockNotarization(input);
  }

  const explorerBase = env.iota.explorerBase;
  const networkName = env.iota.networkName;
  const client = await getNotarizationClient();

  const days = input.deleteLockDays ?? 3650;
  const deleteUnlockAt = Math.round(Date.now() / 1000 + days * 86400);

  const data = new TextEncoder().encode(input.sha256Hex);

  const { output: notarization, response } = await client
    .createLocked()
    .withBytesState(data, "sha256")
    .withDeleteLock(TimeLock.withUnlockAt(deleteUnlockAt))
    .withImmutableDescription(input.description)
    .withUpdatableMetadata(input.updatableMetadata ?? "")
    .finish()
    .buildAndExecute(client);

  const txDigest = response.digest;
  const objectId = notarization.id.startsWith("0x")
    ? notarization.id
    : `0x${notarization.id}`;
  const notarizedAtIso = new Date().toISOString();

  const explorerUrl = `${explorerBase.replace(/\/$/, "")}/txblock/${txDigest}?network=${networkName}`;

  return {
    objectId,
    txDigest,
    notarizedAtIso,
    explorerUrl,
  };
}
