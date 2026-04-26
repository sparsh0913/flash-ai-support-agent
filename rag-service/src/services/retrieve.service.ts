import { embeddings } from "../config/embedding.js";
import { pineconeIndex } from "../config/pinecone.js";

export async function searchDocs(queries: string[] , userId: string){

    const query = queries[0];
    const vector = await embeddings.embedQuery(query);

    const results = await pineconeIndex.query({
        vector,
        topK:5,
        includeMetadata:true,
        filter: {
            userId: {$eq:userId}
        }
    })

    return results.matches ?? [];
}