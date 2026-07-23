import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";

export async function saveUrl(url){
    try {
        return await prisma.shortenedUrls.create({
            data: {
                originalUrl: url
            }
        });
    } catch (error) {
        throw new DataAccessError(error.message, { cause: error });
    }
        
}

export async function readUrl(urlId){
    try {
        return await prisma.shortenedUrls.findUnique({
            where: {id: urlId},
        });
    } catch (error) {
        throw new DataAccessError(error.message, { cause: error});
    }
}