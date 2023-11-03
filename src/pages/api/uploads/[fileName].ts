import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import { fileTypeFromStream } from 'file-type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { fileName } = req.query;

    try {
        const file = fs.readFileSync(`./public/uploads/${fileName}`);
        const fileStream = fs.createReadStream(`./public/uploads/${fileName}`);
        const mime = await fileTypeFromStream(fileStream as unknown as ReadableStream);
        const fileNameNoAccent = (fileName as string).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        res.setHeader('Content-Type', mime?.mime || 'application/octet-stream');
        if(req.query.download === '1') res.setHeader('Content-Disposition', `attachment; filename=${fileNameNoAccent}`);
        res.send(file)
    } catch (error) {
        res.status(404).send('File not found');
    }
}