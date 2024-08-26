import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import FormData from "form-data";

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
      output_format: "png" as const,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      //"https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
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
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
