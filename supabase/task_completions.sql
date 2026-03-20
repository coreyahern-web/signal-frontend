create table task_completions (
  id uuid primary key default gen_random_uuid(),
  entry_id text references knowledge_entries(id),
  task_index int not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(entry_id, task_index)
);
alter table task_completions enable row level security;
create policy "Service role full access" on task_completions for all to service_role using (true) with check (true);
