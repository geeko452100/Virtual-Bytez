-- Ensure API roles can reach public tables (external migrations may omit default Supabase grants).

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant select on public.products to anon;

-- Profiles: allow users to create their own row if the auth trigger did not run.
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
