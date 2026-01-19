create extension if not exists vector;

create table if not exists public.documents (
  id bigint primary key generated always as identity,
  content text not null,
  metadata jsonb,
  embedding vector(1024)
);

create or replace function public.match_documents(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      d.id,
      d.content,
      d.metadata,
      1 - (d.embedding <=> query_embedding) as similarity
    from public.documents d
    where d.embedding is not null
      and 1 - (d.embedding <=> query_embedding) >= match_threshold
    order by similarity desc
    limit match_count;
end;
$$;

