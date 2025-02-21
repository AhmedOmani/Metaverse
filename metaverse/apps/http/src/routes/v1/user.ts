import { Router } from "express";
import * as validation from "../../types"
import client from "@repo/db/client"
import {userMiddleware} from "../../ middleware/user"
export const userRoutes = Router() ;

userRoutes.post("/metadata" , userMiddleware , async (req , res) => {
    const parsedData = validation.updateMetadataSchema.safeParse(req.body) ;
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed"
        });
        return ;
    }
    await client.user.update({
        where: { 
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    });
    res.status(200).json({
        message: "Metadata updated"
    });
});

userRoutes.get("/metadata/bulk" , async (req , res) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = userIdString.slice(1, userIdString.length - 1).split(",");
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        } , select:{
            avatar: true,
            id: true
        }
    });
    res.status(200).json({
        avatars: metadata.map(m => ({
            userId: m.id ,
            avatarId:m.avatar?.imageUrl
        }))
    });
});


