import { Request, Response, NextFunction } from "express";
import jwt from "jsonWebtoken";
import { config } from "../../config/env.js";
import userModel from "../models/user.model.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    message: "Access token required"
  });
}

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token, config.JWT_SECRET) as {
  id: string;
  sessionId: string;
};

const user = await userModel.findById(decoded.id).select("-password");

if (!user) {
  return res.status(401).json({
    message: "User not found"
  });
}

(req as any).user = user;
next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
}

export async function optionalAuth(
   req: Request,
   res: Response,
   next: NextFunction
){
   try {

      const authHeader = req.headers.authorization;

      if(!authHeader || !authHeader.startsWith("Bearer ")){
         return next();
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, config.JWT_SECRET) as {
         id:string;
      };

      const user = await userModel
      .findById(decoded.id)
      .select("-password");

      if(user){
         (req as any).user = user;
      }

      next();

   } catch(error){
      next();
   }
}