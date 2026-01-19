import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { LangChainStream, StreamingTextResponse } from "ai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: Request) {
  const body = await req.json();
  const question: string = body?.question ?? "";
  if (!question || typeof question !== "string") {
    return new Response(JSON.stringify({ error: "invalid question" }), { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_PRIVATE_KEY as string
  );

  const embeddings = new OpenAIEmbeddings({
    model: "BAAI/bge-m3",
    apiKey: process.env.SILICONFLOW_API_KEY,
    baseURL: "https://api.siliconflow.cn/v1",
  });

  const queryEmbedding = await embeddings.embedQuery(question);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.2,
    match_count: 5,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  type MatchRow = { id: number; content: string; metadata: unknown; similarity: number };
  const rows: MatchRow[] = (data ?? []) as MatchRow[];
  const context = rows.map((d) => d.content).join("\n\n");

  const chatModel = new ChatOpenAI({
    model: "deepseek-ai/DeepSeek-V3",
    apiKey: process.env.SILICONFLOW_API_KEY,
    baseURL: "https://api.siliconflow.cn/v1",
    temperature: 0.3,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Use the provided context to answer the user question.\n\nContext:\n{context}"],
    ["human", "{question}"],
  ]);

  const chain = prompt.pipe(chatModel).pipe(new StringOutputParser());

  const { stream, handlers } = LangChainStream();
  chain.invoke({ context, question }, { callbacks: [handlers] });
  return new StreamingTextResponse(stream);
}
