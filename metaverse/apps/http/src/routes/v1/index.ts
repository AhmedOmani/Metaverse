import { Router } from "express";
import {adminRoutes} from "./admin";
import {spaceRoutes} from "./space";
import {userRoutes} from "./user";
import * as validation from "../../types"
import {hash , compare} from "../../script"
import jwt from "jsonwebtoken"
const client = require("@repo/db/client")
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
        })


    } catch (e) {
        res.status(500).json({
            message: "Internal server error" 
        });
    }
    
});

router.get("/elements" , (req , res) => {

});

router.get("/avatars" , (req , res) => {

});

router.use("/admin" , adminRoutes);
router.use("/space" , spaceRoutes);
router.use("/user" , userRoutes);
