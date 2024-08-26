import type { NextApiRequest, NextApiResponse } from "next";
import pinataSDK from "@pinata/sdk";
import { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
    // Set a size limit of 10MB
    sizeLimit: "5mb",
  },
};

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT_TOKEN });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = new IncomingForm();

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ error: "Error parsing form data" });
      }

      const file = files.file?.[0]; // Access the first file in the 'file' field
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const options = {
          pinataMetadata: {
            name: file.originalFilename || "uploaded_file",
          },
        };

        const readableStreamForFile = fs.createReadStream(file.filepath);
        const result = await pinata.pinFileToIPFS(
          readableStreamForFile,
          options
        );

        // Clean up the temporary file
        fs.unlinkSync(file.filepath);

        const IpfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        res.status(200).json({
          IpfsHash: result.IpfsHash,
          PinSize: result.PinSize,
          Timestamp: result.Timestamp,
          IpfsUrl: IpfsUrl,
        });
      } catch (error) {
        console.error("Error uploading to IPFS:", error);
        res.status(500).json({ error: "Error uploading to IPFS" });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
