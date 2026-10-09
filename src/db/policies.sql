-- NoorHub production Row Level Security policies.
--
-- NoorHub's server layer always scopes personal data by the authenticated
-- session user (src/lib/auth + src/db/queries). When the database is hosted on
-- Supabase, enable these policies as defence in depth so that a client using
-- the anon key can never read another person's data.
--
-- Run against the Supabase SQL editor. `auth.uid()` is provided by Supabase
-- Auth and must match the `profiles.id` value used by NoorHub.

alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table bookmarks enable row level security;
alter table quran_progress enable row level security;
alter table reading_history enable row level security;
alter table favorite_duas enable row level security;
alter table tasbeeh_sessions enable row level security;
alter table contact_messages enable row level security;

create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own preferences" on user_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own bookmarks" on bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own quran progress" on quran_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own reading history" on reading_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own favourite duas" on favorite_duas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own tasbeeh sessions" on tasbeeh_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Contact messages are insert-only: no one can read other people's messages.
create policy "anyone can send a message" on contact_messages
  for insert with check (true);
