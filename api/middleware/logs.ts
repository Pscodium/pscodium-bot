import { Request, Response, NextFunction } from "express";

export const logs = (req: Request, res: Response, next: NextFunction) => {

    const startTime = new Date();
    const { method, originalUrl } = req;

    res.on('finish', () => {
        const elapsedTime = new Date().getTime() - startTime.getTime();
        const { statusCode } = res;


        console.log(`[${method}] ${originalUrl} - ${statusCode} (${elapsedTime + 'ms'})`);
    });

    next();
};
