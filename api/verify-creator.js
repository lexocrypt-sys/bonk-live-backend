import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { wallet, signature, message, tokenMint } = req.body;

  if (!wallet || !signature || !message || !tokenMint) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const pubKey = new PublicKey(wallet);
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      Uint8Array.from(signature),
      pubKey.toBytes()
    );

    if (!verified) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const response = await fetch(
      `https://api.helius.xyz/v0/tokens/${tokenMint}?api-key=${HELIUS_API_KEY}`
    );
    const data = await response.json();

    const creator = data?.mintAuthority || data?.creator;

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const canGoLive = creator === wallet;

    return res.json({ canGoLive, creator });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
