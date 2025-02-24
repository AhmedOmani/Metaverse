import { Router } from "express";
import {adminRoutes} from "./admin";
import {spaceRoutes} from "./space";
import {userRoutes} from "./user";
import * as validation from "../../types"
import {hash , compare} from "../../script"
import jwt from "jsonwebtoken"
import client from "@repo/db/client"
import {JWT_PASSWORD} from "../../config"

export const router = Router() ;

router.post("/signup" , async (req , res) => {
    //validate data
    const parseData = validation.SignupSchema.safeParse(req.body);
    
    if (!parseData.success) {
        res.status(400).json({
            message: "Validation error during signup"
        });
        return
    }
    //store to database
    try {
        const hashedPassword = await hash(parseData.data.password);
        const user = await client.user.create({
            data: {
                username: parseData.data.username,
                password: hashedPassword,
                role: parseData.data.type === "admin"? "Admin" : "User" 
            }
        });
        res.status(201).json({
            userId: user.id
        });
    } catch(e) {
        res.status(400).json({
            message: "username taken from another user , try different one!" 
        })
    }
});

router.post("/signin" , async (req , res) => {
    const parseData = validation.SigninSchema.safeParse(req.body) ;
    if (!parseData.success) {
        res.status(403).json({
            message: "validation error , try again!" 
        });
        return ;
    }

    console.log(req.body);

    try {   
        const user = await client.user.findUnique({
            where: {
                username: parseData.data.username
            }
        });

        if (!user) {
            res.status(403).json({
                message: "User not found"
            });
            return ;
        }

        const isValidPassword = await compare(parseData.data.password, user.password);
        if (!isValidPassword) {
            res.status(403).json({
                message: "Invalid password"
            }); 
            return ;
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD)
        
        res.status(200).json({
            message: "Signin successfully",
            token : token
        });

    } catch (e) {
        res.status(500).json({
            message: "Internal server error" 
        });
    }
    
});

router.get("/elements", async (req, res) => {
    const elements: { id: string; width: number; height: number; static: boolean; imageUrl: string }[] = await client.element.findMany();
    res.json({
        elements: elements.map(e => ({
            id: e.id,
            width: e.width,
            height: e.height,
            static: e.static,
            imageUrl: e.imageUrl
        })),
    });
});

router.get("/avatars" , async (req , res) => {
    const avatars: {id: string , imageUrl: string | null , name: string | null} [] = await client.avatar.findMany();
    res.json({
        avatars: avatars.map(x => ({
            id: x.id,
            imageUrl: x.imageUrl ,
            name: x.name ,
        }))
    })
});

router.use("/admin" , adminRoutes);
router.use("/space" , spaceRoutes);
router.use("/user" , userRoutes);
