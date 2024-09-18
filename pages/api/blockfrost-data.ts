import { NextApiRequest, NextApiResponse } from "next";
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from "@blockfrost/blockfrost-js";

const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;

let api: BlockFrostAPI | null = null;

if (blockfrostApiKey) {
  api = new BlockFrostAPI({
    projectId: blockfrostApiKey,
  });
} else {
  console.error("BLOCKFROST_API_KEY is not set in the environment variables");
}

// Updated DetailedAsset interface
interface DetailedAsset {
  unit: string;
  quantity: string;
  policyId: string | null;
  assetName: string | null;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    [key: string]: any;
  } | null;
  transactionMetadata: {
    message?: string;
    [key: string]: any;
  } | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!api) {
    return res.status(500).json({ error: "BlockFrost API is not initialized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { walletAddress } = req.body;

  if (!walletAddress || typeof walletAddress !== "string") {
    return res.status(400).json({ error: "Invalid or missing wallet address" });
  }

  try {
    await fetchAndProcessAssets(api, walletAddress, res);
  } catch (error: unknown) {
    handleError(error, res);
  }
}

async function fetchAndProcessAssets(
  api: BlockFrostAPI,
  walletAddress: string,
  res: NextApiResponse
) {
  const addressInfo = await api.addresses(walletAddress);
  const assets = addressInfo.amount;

  const detailedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (asset.unit === "lovelace") {
        return {
          ...asset,
          policyId: null,
          assetName: null,
          metadata: null,
          transactionMetadata: null,
        };
      }
      const assetInfo = await api.assetsById(asset.unit);
      console.log("Asset Info:", assetInfo); // Debug log

      const onchainMetadata = assetInfo.onchain_metadata || {};
      const offchainMetadata = assetInfo.metadata || {};

      const combinedMetadata = { ...offchainMetadata, ...onchainMetadata };

      // Fetch the latest transaction for this asset
      const transactions = await api.assetsTransactions(asset.unit, {
        order: "desc",
        count: 1,
      });
      let transactionMetadata = null;
      if (transactions.length > 0) {
        const txHash = transactions[0].tx_hash;
        const txMetadata = await api.txsMetadata(txHash);
        transactionMetadata =
          txMetadata.find((m) => m.label === "721")?.json_metadata || null;
      }

      console.log("Combined Metadata:", combinedMetadata); // Debug log
      console.log("Transaction Metadata:", transactionMetadata); // Debug log

      return {
        ...asset,
        policyId: assetInfo.policy_id,
        assetName: assetInfo.asset_name,
        metadata: combinedMetadata,
        transactionMetadata: transactionMetadata,
      };
    })
  );

  res.status(200).json({ assets: detailedAssets });
}

function handleError(error: unknown, res: NextApiResponse) {
  console.error("Error fetching assets:", error);
  if (error instanceof BlockfrostServerError) {
    res.status(error.status_code).json({
      error: "BlockFrost API error",
      details: error.message,
      status_code: error.status_code,
    });
  } else {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to fetch assets",
      details: errorMessage,
    });
  }
}
