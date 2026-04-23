import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login" , authController.login);

authRouter.get("/me", requireAuth, authController.getMe)

authRouter.post("/logout", authController.logout)

authRouter.get("/refreshToken", authController.refreshToken);
export default authRouter;