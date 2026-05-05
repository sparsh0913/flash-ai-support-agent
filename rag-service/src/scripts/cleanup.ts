import { pineconeIndex } from "../config/pinecone.js";

async function cleanup() {
  console.log("Deleting corrupted vectors...");
  
 await pineconeIndex.deleteAll();

  console.log("Done!");
}

cleanup();