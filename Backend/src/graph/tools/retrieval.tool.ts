import "dotenv/config";
import axios from "axios";

export async function retrievalTool(
  queries: string[],
  userId: string,
  chatId:string
) {
  try {
    const { data } = await axios.post(
      `${process.env.RAG_URL}/search`,
      {
        queries,
        userId,
        chatId
      }
    );

    if (!data.docs || data.docs.length === 0) {
  return { success: false, docs: [], reason: "No relevant documents found" };
}
    return data;
  } catch (error) {
    console.log("Retrieval Tool Error:", error);

    return {
      success: false,
      docs: [],
    };
  }
}