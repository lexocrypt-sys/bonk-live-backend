import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet, tokenMint } = req.body;

    if (!wallet || !tokenMint) {
      return res.status(400).json({ error: "Missing params" });
    }

    const connection = new Connection(HELIUS_RPC);
    const mint = new PublicKey(tokenMint);

    const accountInfo = await connection.getParsedAccountInfo(mint);

    if (!accountInfo.value) {
      return res.status(404).json({ error: "Token not found" });
    }

    const creator =
      accountInfo.value.data.parsed.info.mintAuthority;

    const isCreator = creator === wallet;

    return res.status(200).json({ isCreator });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
