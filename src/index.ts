import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const s3 = new S3Client({ region: "ap-south-1" })

const BUCKET_NAME = process.env.BUCKET_NAME!;

app.get("/*", async (req, res) => {
    const host = req.hostname;
    const id = host.split(".")[0];
    let filePath = req.path;

    if (filePath === "/") {
        filePath = "/index.html";
    }

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `dist/${id}${filePath}`
        })
        
        const data = await s3.send(command);

        if(!data.Body){
            res.status(404).send("File not found");
            return;
        }

        let contentType = data.ContentType;
        if (!contentType || contentType === "application/octet-stream") {
            if (filePath.endsWith(".html") || filePath === "/") contentType = "text/html";
            else if (filePath.endsWith(".css")) contentType = "text/css";
            else if (filePath.endsWith(".js")) contentType = "application/javascript";
            else if (filePath.endsWith(".png")) contentType = "image/png";
            else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (filePath.endsWith(".svg")) contentType = "image/svg+xml";
            else contentType = "application/octet-stream";
        }
        
        res.set("Content-Type", contentType);
        const bodyContents = await data.Body.transformToByteArray();
        res.send(Buffer.from(bodyContents));

    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving file");
        return;
    }

})

app.listen(3001);