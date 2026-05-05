import { embeddings } from "../config/embedding.js";
import { pineconeIndex } from "../config/pinecone.js";

export async function searchDocs(queries: string[] , userId: string){
const MIN_SCORE = 0.10;
    const query = queries[0];
    const vector = await embeddings.embedQuery(query);

    const results = await pineconeIndex.query({
        vector,
        topK:5,
        includeMetadata:true,
        filter: {
         userId: userId
       }
    })

    /* return results.matches ?? []; */
     return (results.matches ?? []).filter(m => (m.score ?? 0) >= MIN_SCORE);
}