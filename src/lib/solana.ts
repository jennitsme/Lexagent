import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

const RPC_URL = "https://solana-rpc.publicnode.com";

let connectionInstance: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(RPC_URL, "confirmed");
  }
  return connectionInstance;
}

export async function getSolBalance(address: string): Promise<number> {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  return tokenAccounts.value.map((account) => {
    const parsed = account.account.data.parsed.info;
    return {
      mint: parsed.mint as string,
      amount: Number(parsed.tokenAmount.uiAmount),
      decimals: parsed.tokenAmount.decimals as number,
    };
  });
}

export interface TransactionInfo {
  signature: string;
  timestamp: number | null;
  type: "sent" | "received" | "unknown";
  amount: number | null;
  status: string;
}

export async function getRecentTransactions(
  address: string,
  limit: number = 10
): Promise<TransactionInfo[]> {
  const connection = getConnection();
  const publicKey = new PublicKey(address);

  const signatures = await connection.getSignaturesForAddress(publicKey, {
    limit,
  });

  const transactions: TransactionInfo[] = [];

  for (const sig of signatures) {
    let type: "sent" | "received" | "unknown" = "unknown";
    let amount: number | null = null;

    try {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (tx?.meta && tx.transaction) {
        const accountKeys = tx.transaction.message.accountKeys;
        const preBalances = tx.meta.preBalances;
        const postBalances = tx.meta.postBalances;

        const ownerIndex = accountKeys.findIndex(
          (key) => key.pubkey.toString() === address
        );

        if (ownerIndex !== -1) {
          const diff = (postBalances[ownerIndex] - preBalances[ownerIndex]) / LAMPORTS_PER_SOL;
          if (diff < 0) {
            type = "sent";
            amount = Math.abs(diff);
          } else if (diff > 0) {
            type = "received";
            amount = diff;
          }
        }
      }
    } catch {
      // skip parsing errors
    }

    transactions.push({
      signature: sig.signature,
      timestamp: sig.blockTime ?? null,
      type,
      amount,
      status: sig.confirmationStatus ?? "confirmed",
    });
  }

  return transactions;
}

export async function sendSol(
  fromPublicKey: string,
  toAddress: string,
  amountSol: number
): Promise<Transaction> {
  const connection = getConnection();
  const from = new PublicKey(fromPublicKey);
  const to = new PublicKey(toAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  return transaction;
}

export async function createPrivatePool(
  fromPublicKey: string,
  amountSol: number
): Promise<{ transaction: Transaction; claimCode: string; poolAddress: string }> {
  const connection = getConnection();
  const from = new PublicKey(fromPublicKey);
  const poolKeypair = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: poolKeypair.publicKey,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  const secretBytes = poolKeypair.secretKey;
  const claimCode = bs58.encode(secretBytes);

  return {
    transaction,
    claimCode,
    poolAddress: poolKeypair.publicKey.toString(),
  };
}

export async function claimFromPool(
  claimCode: string,
  recipientAddress: string
): Promise<string> {
  const connection = getConnection();

  let secretKey: Uint8Array;
  try {
    secretKey = bs58.decode(claimCode);
  } catch {
    throw new Error("Invalid claim code");
  }

  if (secretKey.length !== 64) {
    throw new Error("Invalid claim code format");
  }

  const poolKeypair = Keypair.fromSecretKey(secretKey);
  const recipient = new PublicKey(recipientAddress);

  const poolBalance = await connection.getBalance(poolKeypair.publicKey);
  if (poolBalance === 0) {
    throw new Error("This code has already been claimed or the pool is empty");
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: poolKeypair.publicKey,
      toPubkey: recipient,
      lamports: poolBalance,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = poolKeypair.publicKey;

  const fee = await connection.getFeeForMessage(transaction.compileMessage());
  const feeAmount = fee.value ?? 5000;
  const transferAmount = poolBalance - feeAmount;

  if (transferAmount <= 0) {
    throw new Error("Pool balance too low to cover transaction fees");
  }

  transaction.instructions[0] = SystemProgram.transfer({
    fromPubkey: poolKeypair.publicKey,
    toPubkey: recipient,
    lamports: transferAmount,
  });

  transaction.sign(poolKeypair);

  const signature = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

export async function getSOLPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const data = await response.json();
    return data.solana.usd as number;
  } catch {
    return 0;
  }
}
