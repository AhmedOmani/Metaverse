import { Router } from "express";
import {adminRoutes} from "./admin";
import {spaceRoutes} from "./space";
import {userRoutes} from "./user";
export const router = Router() ;

router.post("/signup" , (req , res) => {
    res.json({
        message: "Signup"
    });
});

router.post("/signin" , (req , res) => {
    res.json({
        message: "Signin"
    });
});

router.get("/elements" , (req , res) => {

});

router.get("/avatars" , (req , res) => {

});

router.use("/admin" , adminRoutes);
router.use("/space" , spaceRoutes);
router.use("/user" , userRoutes);
