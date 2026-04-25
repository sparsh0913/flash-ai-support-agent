import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "../config/embedding.js";
import { pineconeIndex } from "../config/pinecone.js";

//reading pdf
export async function readPdf(filePath : string){
    const loader = new PDFLoader(filePath , {
        splitPages:true
    })

    const docs = await loader.load();
    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:100
    })

    const chunks = await splitter.splitDocuments(docs);
    return chunks;
}

export async function processPdf(filePath: string ,fileName:string , userId:string ){

  const chunks = await readPdf(filePath);
   
 const vectors = await Promise.all(
  chunks.map(async (chunk, index) => {
    const values = await embeddings.embedQuery(chunk.pageContent);

    return {
      id: `${userId}-${fileName}-${index}`,
      values,
      metadata: {
        userId,
        fileName,
        chunkIndex: index,
        text: chunk.pageContent,
      },
    };
  })
);

await pineconeIndex.upsert(vectors);

return {
  fileName,
  userId,
  totalChunks: chunks.length,
  storedVectors: vectors.length
};
}

