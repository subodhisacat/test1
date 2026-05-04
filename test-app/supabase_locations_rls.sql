-- SQL to create the 'locations' table with RLS and insert policy
CREATE TABLE public.locations (
  id bigint generated always as identity primary key,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow public inserts"
ON public.locations
FOR INSERT
TO anon
WITH CHECK (true);
