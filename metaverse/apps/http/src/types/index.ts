import z from "zod"

const dimensionRegex = /^[0-9]{1,4}x[0-9]{1,4}$/

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["user" , "admin"])
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["user" , "admin"])
});

export const updateMetadataSchema = z.object({
    avatarId: z.string()
});

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().refine((val) => dimensionRegex.test(val) , {
        message: "Dimensions must be in the format 'widthxheight' (e.g., '100x100)",
    }),
    mapId: z.string() 
});

export const deleteSpaceSchema = z.object({
    spaceId: z.string() 
});

export const addElementSchema = z.object({
    elementId : z.string() ,
    spaceId: z.string() ,
    x: z.number(),
    y: z.number()
});

export const createElementSchema = z.object({
    imageUrl: z.string() ,
    width: z.number() ,
    height: z.number(),
    static: z.boolean()
});

export const updateElementSchema = z.object({
    imageUrl: z.string() 
});

export const createAvatar = z.object({
    name: z.string() ,
    imageUrl: z.string()
});

export const createMapSchema = z.object({
    thumbnail: z.string() ,
    dimensions: z.string().refine((val) => dimensionRegex.test(val) , {
        message: "Dimensions must be in the format 'widthxheight' (e.g., '100x100)",
    }),
    defualtElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
});