import { Router } from "express";
import * as validation from "../../types/index"
import client from "@repo/db/client"
import { userMiddleware } from "../../ middleware/user";

export const spaceRoutes = Router() ;

spaceRoutes.post("/" , userMiddleware , async (req , res) => {
    const parsedData = validation.createSpaceSchema.safeParse(req.body) ;

    if (!parsedData.success) {
       
        res.status(400).json({
            message: "Space validaion failed!",
            data: req.body
        });
        return ;
    }
  
    // if map does not exist we create an empty space
    if(!parsedData.data.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                heigth: parseInt(parsedData.data.dimensions.split("x")[1]), // Note: changed from "y" to "x"
                creator: {
                    connect: {
                        id: req.userId!
                    }
                }
            }
        });
        res.json({spaceId: space.id});
        return ;
    }

    // if map exist we need to find all related things (e.g. elements);
    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        } ,
        select: {
            width: true,
            height: true ,
            mapElements: true
        }
    });

    if (!map) {
        res.status(400).json({
            message: "Map not found"
        });
        return ;
    }

    let Space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                heigth: map.height,  // Fixed typo from 'heigth'
                creator: {          // Changed from creatorId to creator
                    connect: {
                        id: req.userId!
                    }
                }
            }
        });
        
        await client.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        });
        
        return space;
    });
    res.json({spaceId: Space.id});
});

spaceRoutes.post("/element" , userMiddleware , async (req , res) => {
    const parsedData = validation.addElementSchema.safeParse(req.body) ;
    if (!parsedData) {
        res.status(400).json({
            message: "Validation for creating element in space failed"
        });
        return;
    }
    const space = await client.space.findUnique({
        where:{
            id: req.params.spaceId,
            creatorId: req.userId!
        }, select: {
            width: true,
            heigth: true
        }
    });
    if (req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width! || req.body.y > space?.heigth!) {
        res.status(400).json({
            message: "Poibt is outside of the boundray"
        });
        return;
    }
    if (!space) {
        res.status(400).json({message: "Space not found"});
        return;
    }
    await client.spaceElements.create({
        data: {
            spaceId: req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y
        }
    });
    res.json({message: "Element added"});
});

spaceRoutes.get("/all" , userMiddleware , async (req , res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId!
        }
    });
    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            thumbnail: s.thumbnail,
            dimensions: `${s.width}x${s.heigth}`
        }))
    });
});

spaceRoutes.get("/:spaceId" , async (req , res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        }, 
        include: {
            elements: {
                include: {
                    element: true
                }
            }
        }
    });
    if (!space) {
        res.status(400).json({
            message: "Space not found"
        });
        return;
    }
    res.json({
        dimensions: `${space.width}x${space.heigth}`,
        elements: space.elements.map(e => ({
            id: e.id ,
            element: {
                id : e.element.id,
                imageUrl: e.element.imageUrl,
                width: e.element.width,
                height: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        }))
    }) ;
   
});

spaceRoutes.delete("/:spaceId" , userMiddleware , async (req , res) => {
    const parsedData = validation.deleteSpaceSchema.safeParse(req.body) ;
    if (!parsedData) {
        res.status(400).json({
            message: "validation deleting failed"
        });
        return;
    }
    const space = await client.space.findUnique({
        where:{
            id: req.params.spaceId
        }, select: {
            creatorId: true
        }
    });
    if (!space) {
        res.status(400).json({
            message: "Space does not exist"
        });
        return ;
    }
    if (space?.creatorId !== req.userId) {
        res.status(400).json({
            message: "You are not the owner of space to delete it!"
        });
        return;
    }
    await client.space.delete({
        where: {
            id: req.params.spaceId
        }
    });
    res.json({
        message: "Space deleted"
    });
});

spaceRoutes.delete("/element" , userMiddleware , async (req , res) => {
    const parsedData = validation.deleteElementSpaceSchema.safeParse(req.body);
    if (!parsedData) {
        res.status(400).json({
            message: "deleting element failed cause validation error"
        });
        return ;
    }
    const spaceElement = await client.spaceElements.findFirst({
        where: {
            id: parsedData.data?.id
        },
        include:{
            space: true
        }
    });
    if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
    await client.spaceElements.delete({
        where: {
            id: parsedData.data?.id
        }
    });
    res.json({message: "Element deleted from space"});
});
