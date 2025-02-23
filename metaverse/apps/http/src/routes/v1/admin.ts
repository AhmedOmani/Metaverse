import { Router } from "express";
import {adminMiddleware} from "../../ middleware/admin"
import * as validation from "../../types/index"

import client from "@repo/db/client"
export const adminRoutes = Router() ;

adminRoutes.post("/element" , adminMiddleware , async (req , res) =>{
    const parsedData = validation.createElementSchema.safeParse(req.body) ;
    if (!parsedData) {
        res.status(400).json({
            message: "validation failed"
        });
        return ;
    }

    const width = Number(parsedData.data?.width);
    const height = Number(parsedData.data?.height);
    if (isNaN(width) || isNaN(height)) {
        throw new Error("Width | Height must be a valid number");
    }
    const element = await client.element.create({
        data: {
            imageUrl: parsedData.data?.imageUrl ?? "" ,
            width: width,
            height: height,
            static: parsedData.data?.static ?? false
        }
   });
   res.json({message: "Element created" , id: element.id});
});

adminRoutes.put("/element/:elementId", async (req , res) => {
    const parsedData = validation.updateElementSchema.safeParse(req.body) ;
    if (!parsedData) {
        res.status(400).json({
            message: "validation failed"
        });
        return ;
    }
    await client.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: parsedData.data?.imageUrl
        }
    });
    res.json({message: "Element updated"});
});

adminRoutes.post("/avatar" , adminMiddleware , async (req , res) => {
    const parsedData = validation.createAvatar.safeParse(req.body) ;
    if (!parsedData) {
        res.status(400).json({
            message: "validation failed"
        });
        return ;
    }
    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data?.name,
            imageUrl: parsedData.data?.imageUrl
        }
    });
    res.json({id: avatar.id});
});

adminRoutes.post("/map", adminMiddleware, async (req, res) => {
    const parsedData = validation.createMapSchema.safeParse(req.body);

    if (!parsedData.success) {  
        res.status(400).json({ message: "Validation failed" });
        return;
    }

    const { name, thumbnail, dimensions, defaultElements } = parsedData.data; // ✅ Now TypeScript knows `data` is valid

    const map = await client.map.create({
        data: {
            name: name ,
            width: parseInt(dimensions.split("x")[0]),  
            height: parseInt(dimensions.split("x")[1]), 
            thumbnail: thumbnail ,
            mapElements: {
                create: defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    });

    res.json({ id: map.id });
});
