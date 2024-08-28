// File: pages/api/generate-image-sd16.tsx

import type { NextApiRequest, NextApiResponse } from "next";
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  console.log('API Route accessed:', req.method, req.url);

  if (req.method !== "POST") {
    console.log('Method not allowed:', req.method);
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt, height, width } = req.body;

  if (!prompt) {
    console.log('Missing prompt in request body');
    return res.status(400).json({ error: "Prompt is required" });
  }

  const engineId = "stable-diffusion-v1-6";
  const apiHost = process.env.STABILITY_API_HOST ?? "https://api.stability.ai";
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    console.log('Missing Stability API key');
    return res.status(500).json({ error: "Missing Stability API key." });
  }

  try {
    console.log('Sending request to Stability API');
    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: height || 512,
          width: width || 512,
          steps: 30,
          samples: 1,
          style_preset: req.body.style_preset,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error:', response.status, errorText);
      throw new Error(`Non-200 response: ${errorText}`);
    }

    const responseJSON = await response.json();
    console.log('Stability API response received');

    if (responseJSON.artifacts && responseJSON.artifacts.length > 0) {
      const imageUrl = `data:image/png;base64,${responseJSON.artifacts[0].base64}`;
      res.status(200).json({ imageUrl });
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
