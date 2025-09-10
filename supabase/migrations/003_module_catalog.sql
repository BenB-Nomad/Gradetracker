-- Module catalog: predefined modules to select from
create table if not exists public.module_catalog (
  code text primary key,
  title text not null,
  ects integer not null check (ects between 1 and 30),
  default_scale text not null check (default_scale in ('standard_40','alt_linear_40')),
  created_at timestamptz not null default now()
);

-- Seed initial modules (provided list)
insert into public.module_catalog (code, title, ects, default_scale) values
  ('FDSC10010','Food Diet & Health',5,'alt_linear_40')
  on conflict (code) do nothing;

insert into public.module_catalog (code, title, ects, default_scale) values
  ('MEEN30100','Engineering Thermodynamics II',5,'standard_40')
  on conflict (code) do nothing;

insert into public.module_catalog (code, title, ects, default_scale) values
  ('MEEN30090','Materials Science & Engineering II',5,'standard_40')
  on conflict (code) do nothing;

insert into public.module_catalog (code, title, ects, default_scale) values
  ('MEEN30030','Mechanical Engineering Design II',5,'standard_40')
  on conflict (code) do nothing;

insert into public.module_catalog (code, title, ects, default_scale) values
  ('EEEN30250','Electrical Machines for Mechanical Engineers',5,'alt_linear_40')
  on conflict (code) do nothing;

insert into public.module_catalog (code, title, ects, default_scale) values
  ('ACM30030','Multivariable Calculus Eng II',5,'standard_40')
  on conflict (code) do nothing;


