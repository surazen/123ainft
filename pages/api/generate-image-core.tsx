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

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const payload = {
      prompt,
      output_format: "webp",
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
        },
        responseType: "arraybuffer",
      }
    );

    if (response.status !== 200) {
      throw new Error(`Non-200 response: ${response.status}`);
    }

    // Convert the image buffer to base64
    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const imageUrl = `data:image/webp;base64,${base64Image}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
