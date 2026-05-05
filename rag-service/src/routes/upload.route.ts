import { Router } from "express";
import multer from "multer";
import { readPdf } from "../services/ingest.service.js";
import { processPdf } from "../services/ingest.service.js";

const router = Router();

const upload = multer({
    dest:"./uploads/"
});

router.post("/", upload.single("pdf"), async (req,res)=>{
    
    try{
   const file = req.file;
   const userId = req.body.userId;

   console.log("UPLOAD BODY:", req.body);
console.log("UPLOAD USER ID:", req.body.userId);

   if(!file){
    return res.status(400).json({
        success:false,
        message:"No file uploaded"
    })
   };

   if (!userId) {
      return res.status(400).json({ success:false, message:"No userId" });
    }

    console.log(userId);

   const result = await processPdf(
  file.path,
  file.originalname,
  userId
);

    res.json({
  success: true,
  ...result
});

    }catch(err){
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({
      success: false,
      message: "Error occurred",
    });
    }
})

export default router;