import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import express from "express";
import dotenv from "dotenv";
import mime from "mime-types"

const app = express();

dotenv.config();

const s3 = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
})

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


        let contentType = data.ContentType || mime.lookup(filePath) || "application/octet-stream";
        
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