import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  imageUrl?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("API route started");

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    console.log(`Invalid method: ${req.method}`);
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt, height, width, style_preset } = req.body;
  console.log(`Received request with prompt: ${prompt}, height: ${height}, width: ${width}, style_preset: ${style_preset}`);

  if (!prompt) {
    console.log("Missing prompt in request");
    return res.status(400).json({ error: "Prompt is required" });
  }

  const engineId = "stable-diffusion-v1-6";
  const apiHost = process.env.STABILITY_API_HOST ?? "https://api.stability.ai";
  const apiKey = process.env.STABILITY_API_KEY;

  console.log(`Using API host: ${apiHost}`);

  if (!apiKey) {
    console.error("Missing Stability API key");
    return res.status(500).json({ error: "Missing Stability API key." });
  }

  try {
    console.log("Sending request to Stability API");
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
          style_preset: req.body.style_preset,  // Updated this line
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Stability API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Stability API error: ${response.status} ${response.statusText}`);
    }

    console.log("Received response from Stability API");
    const responseJSON = await response.json();

    if (responseJSON.artifacts && responseJSON.artifacts.length > 0) {
      console.log("Image generated successfully");
      const imageUrl = `data:image/png;base64,${responseJSON.artifacts[0].base64}`;
      res.status(200).json({ imageUrl });
    } else {
      console.error("No image generated in the response");
      throw new Error("No image generated");
    }
  } catch (error: unknown) {
    console.error("Error in API route:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Error: ${error.message}` });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }

  console.log("API route completed");
}
