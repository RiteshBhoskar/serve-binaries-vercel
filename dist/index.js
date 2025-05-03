"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mime_types_1 = __importDefault(require("mime-types"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const s3 = new client_s3_1.S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});
const BUCKET_NAME = process.env.BUCKET_NAME;
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    const id = host.split(".")[0];
    let filePath = req.path;
    if (filePath === "/") {
        filePath = "/index.html";
    }
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `dist/${id}${filePath}`
        });
        const data = yield s3.send(command);
        if (!data.Body) {
            res.status(404).send("File not found");
            return;
        }
        let contentType = data.ContentType || mime_types_1.default.lookup(filePath) || "application/octet-stream";
        res.set("Content-Type", contentType);
        const bodyContents = yield data.Body.transformToByteArray();
        res.send(Buffer.from(bodyContents));
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving file");
        return;
    }
}));
app.listen(3001);
