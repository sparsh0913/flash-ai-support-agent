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

   if(!file){
    return res.status(400).json({
        success:false,
        message:"No file uploaded"
    })
   };

   const result = await processPdf(
  file.path,
  file.originalname,
  "test-user-1"
);

    res.json({
  success: true,
  ...result
});

    }catch(err){
        res.status(500).json({
      success: false,
      message: "Error occurred",
    });
    }
})

export default router;