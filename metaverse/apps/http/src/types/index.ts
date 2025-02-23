import z from "zod";

const dimensionRegex = /^[0-9]{1,4}x[0-9]{1,4}$/;

const SignupSchema = z.object({
  username: z.string().nonempty() ,
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
});

const SigninSchema = z.object({
  username: z.string().email(),
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
});

const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

const createSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().refine((val) => dimensionRegex.test(val), {
    message: "Dimensions must be in the format 'widthxheight' (e.g., '100x100')",
  }),
  mapId: z.string(),
});

const deleteSpaceSchema = z.object({
  spaceId: z.string(),
});

const deleteElementSpaceSchema = z.object({
  id: z.string() 
})

const addElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

const createElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

const updateElementSchema = z.object({
  imageUrl: z.string(),
});

const createAvatar = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

const createMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().refine((val) => dimensionRegex.test(val), {
    message: "Dimensions must be in the format 'widthxheight' (e.g., '100x100')",
  }),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});

declare global {
    namespace Express {
        export interface Request {
            role?: "Admin" | "User";
            userId?: string
        }
    }
}
// Use ESM export syntax for consistency
export {
  SignupSchema,
  SigninSchema,
  updateMetadataSchema,
  createSpaceSchema,
  deleteSpaceSchema,
  deleteElementSpaceSchema,
  addElementSchema,
  createElementSchema,
  updateElementSchema,
  createAvatar,
  createMapSchema,
};
