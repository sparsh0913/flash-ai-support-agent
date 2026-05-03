import express from "express";
import Chat from "./chat.model.js";
import { requireAuth } from "../auth/middleware/auth.middleware.js";


const router = express.Router();


router.get("/chats", requireAuth, async(req,res)=>{

   try{
           const { mode } = req.query;
           const chatMode = mode as string;
      const chats = await Chat.find({
         userId:(req as any).user._id,
        mode: chatMode
      })
      .select("title updatedAt mode")
      .sort({updatedAt:-1});

      res.json({
         chats
      });

   }catch(error){

      console.log(error);

      res.status(500).json({
         error:"Failed to fetch chats"
      });

   }
});

router.get("/chats/:chatId", requireAuth , async(req,res)=>{

    try{

        const chat = await Chat.findOne({
            _id:req.params.chatId,
            userId:(req as any).user._id
        });

        if(!chat){
            return res.status(404).json({
                error:"Chat not found"
            });
        }

        res.json({
            chat
        });

    }catch(error){

        console.log(error);

        res.status(500).json({
            error:"Failed to fetch chat"
        });

    }

});
export default router;