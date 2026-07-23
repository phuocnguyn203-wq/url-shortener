import { shortenUrl, decodeUrl } from '../services/shortener.service.js';
import client from '../clients/redis.client.js';
import DataAccessError from '../errors/DataAccessError.js';
import { setTimeout } from 'timers/promises';

export const getOriginal = async (req, res) => {
    const code = req.params.code;
    
    let originalUrl = await client.get(code);
    if (originalUrl) return res.redirect(originalUrl);

    await setTimeout(3000);
    try{
        originalUrl = await decodeUrl(code);
        if (!originalUrl) 
            return res.status(400).json({ error: "URL not found" });

        await client.set(code, originalUrl);

        return res.redirect(originalUrl);
    } catch (error) {
        if (error instanceof DataAccessError ) {
            console.log(error.cause);
            return res.status(500).json({ error: "DataAccessError" });
        }
    }
}

export const create = async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl)
        return res.status(400).json({ error: "URL is required "});
    try {
        const code = await shortenUrl(originalUrl);
        if (code === null)
            return res.status(400).json({ error: "Invalid URL" });

        const shortenedUrl = `${req.protocol}://${req.get('host')}/shortened/${code}`;
        return res.json({ shortenedUrl });
    } catch (error) {
        if (error instanceof DataAccessError ) {
            console.log(error.cause);
            return res.status(500).json({ error: "DataAccessError"});
        }
    }
}