import { NextApiRequest, NextApiResponse } from 'next';
import { BlockFrostAPI, BlockfrostServerError } from '@blockfrost/blockfrost-js';

const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;

let api: BlockFrostAPI | null = null;

if (blockfrostApiKey) {
  api = new BlockFrostAPI({
    projectId: blockfrostApiKey,
  });
} else {
  console.error('BLOCKFROST_API_KEY is not set in the environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!api) {
    return res.status(500).json({ error: 'BlockFrost API is not initialized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { walletAddress } = req.body;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing wallet address' });
  }

  try {
    await fetchAndProcessAssets(api, walletAddress, res);
  } catch (error: unknown) {
    handleError(error, res);
  }
}

async function fetchAndProcessAssets(api: BlockFrostAPI, walletAddress: string, res: NextApiResponse) {
  const addressInfo = await api.addresses(walletAddress);
  const assets = addressInfo.amount;

  const detailedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (asset.unit === 'lovelace') {
        return { ...asset, policyId: null, assetName: null, metadata: null };
      }
      const assetInfo = await api.assetsById(asset.unit);
      console.log('Asset Info:', assetInfo); // Debug log

      const onchainMetadata = assetInfo.onchain_metadata || {};
      const offchainMetadata = assetInfo.metadata || {};

      const combinedMetadata = { ...offchainMetadata, ...onchainMetadata };

      console.log('Combined Metadata:', combinedMetadata); // Debug log

      return {
        ...asset,
        policyId: assetInfo.policy_id,
        assetName: assetInfo.asset_name,
        metadata: combinedMetadata,
      };
    })
  );

  res.status(200).json({ assets: detailedAssets });
}

function handleError(error: unknown, res: NextApiResponse) {
  console.error('Error fetching assets:', error);
  if (error instanceof BlockfrostServerError) {
    res.status(error.status_code).json({ 
      error: 'BlockFrost API error', 
      details: error.message,
      status_code: error.status_code
    });
  } else {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to fetch assets', 
      details: errorMessage
    });
  }
}