import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.route.js";
import searchRoute from "./routes/search.route.js";
/* import { pineconeIndex } from "./config/pinecone.js"; */

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "RAG service running"
  });
});

app.use("/upload", uploadRoute);
app.use("/search" , searchRoute);

const PORT = 5001;

const server = app.listen(PORT, () => {
  console.log(`RAG service running on port ${PORT}`);
}); 

