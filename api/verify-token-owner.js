export default async function handler(req, res) {
  try {
    const { walletAddress, tokenAddress } = req.query;

    if (!walletAddress || !tokenAddress) {
      return res.status(400).json({ error: "Missing params" });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

    const response = await fetch(
      `https://api.helius.xyz/v0/tokens/metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mintAccounts: [tokenAddress],
        }),
      }
    );

    const data = await response.json();

    if (!data || !data[0]) {
      return res.json({ isOwner: false });
    }

    const updateAuthority = data[0].updateAuthority;

    const isOwner =
      updateAuthority &&
      updateAuthority.toLowerCase() === walletAddress.toLowerCase();

    return res.json({
      isOwner,
      creator: updateAuthority,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
