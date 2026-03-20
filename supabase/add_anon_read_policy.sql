-- Allow anonymous read access to knowledge_entries
create policy "Allow anonymous read access"
on knowledge_entries
for select
to anon
using (true);

-- Allow anonymous read access to task_completions
create policy "Allow anonymous read access"
on task_completions
for select
to anon
using (true);

-- Allow anonymous insert/update on task_completions (for checkbox state)
create policy "Allow anonymous write access"
on task_completions
for all
to anon
using (true)
with check (true);
