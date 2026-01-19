import { NextRequest, NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SILICONFLOW_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing SILICONFLOW_API_KEY' }, { status: 500 });
    }
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (>5MB)' }, { status: 400 });
    }

    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';

    if (file.type === 'application/pdf') {
      const mod = await import('pdf-parse');
      const pdfParse = (mod as unknown as { default?: (b: Buffer) => Promise<{ text: string }> }).default ?? (mod as unknown as (b: Buffer) => Promise<{ text: string }>);
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }

    // 切片
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });
    const output = await splitter.createDocuments([text]);

    // 向量化 (SiliconFlow)
    const embeddings = new OpenAIEmbeddings({
      model: "BAAI/bge-m3",
      apiKey,
      baseURL: "https://api.siliconflow.cn/v1",
    });

    // Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contents = output.map(d => d.pageContent);
    let vectors: number[][];
    try {
      vectors = await embeddings.embedDocuments(contents);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `Embedding failed: ${msg}` }, { status: 500 });
    }
    const dim = vectors[0]?.length ?? 0;
    if (dim !== 1024) {
      return NextResponse.json({ error: `Embedding dimension ${dim} != 1024. Ensure model BAAI/bge-m3 and table vector(1024).` }, { status: 500 });
    }
    const rows = contents.map((c, i) => ({
      content: c,
      metadata: { filename: file.name },
      embedding: vectors[i],
    }));
    const { error: insertError } = await supabase.from('documents').insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
