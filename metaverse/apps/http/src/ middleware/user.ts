import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../config";
import { NextFunction , Request , Response } from "express";

export const userMiddleware = (req: Request , res:Response , next: NextFunction) => {
    const header = req.headers.authorization ; // [Bearer , token]
    const token = header?.split(" ")[1];
    if (!token) {
        res.status(400).json({
            message : "You are not authorized , Admin permission!"
        });
        return;
    }
    try {
        const decode = jwt.verify(token , JWT_PASSWORD) as {userId: string , role: string};
        req.userId = decode.userId
        next();
    } catch (e) {
        res.status(400).json({
            message: "Unauthorized"
        });
    }
}
