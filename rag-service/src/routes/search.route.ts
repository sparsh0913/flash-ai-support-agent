import express from "express";
import { searchDocs } from "../services/retrieve.service.js";

const router = express.Router();

router.post("/" , async (req,res)=>{

    try{
    const {queries, userId} = req.body;
    const docs = await searchDocs(queries,userId);

    res.json({
      success: true,
      docs,
    });

    }catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
})

export default router;