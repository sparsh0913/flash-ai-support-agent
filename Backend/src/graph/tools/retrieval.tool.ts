import axios from "axios";

export async function retrievalTool(
  queries: string[],
  userId: string
) {
  try {
    const { data } = await axios.post(
      "http://localhost:5001/search",
      {
        queries,
        userId,
      }
    );

    return data;
  } catch (error) {
    console.log("Retrieval Tool Error:", error);

    return {
      success: false,
      docs: [],
    };
  }
}