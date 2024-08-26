import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type Data = {
  imageUrl?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt, height, width } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // SDXL specific payload
    const payload = {
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: height || 512,
      width: width || 512,
      steps: 30,
      samples: 1,
      style_preset: req.body.style_preset,
    };

    // Make request to SDXL API
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        responseType: "json",
      }
    );

    if (response.status !== 200) {
      throw new Error(`Non-200 response: ${response.status}`);
    }

    // Process SDXL response
    const responseData = response.data;
    if (responseData.artifacts && responseData.artifacts.length > 0) {
      const base64Image = responseData.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      res.status(200).json({ imageUrl });
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
