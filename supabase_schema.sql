-- Création de la table profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  dark_mode boolean default false,
  notifications boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Activer la RLS (Row Level Security) pour la table profiles
alter table profiles enable row level security;

-- Créer des politiques RLS pour profiles
create policy "Les utilisateurs peuvent voir leur propre profil" 
on profiles for select 
using (auth.uid() = id);

create policy "Les utilisateurs peuvent mettre à jour leur propre profil" 
on profiles for update 
using (auth.uid() = id);

create policy "Les utilisateurs peuvent insérer leur propre profil" 
on profiles for insert 
with check (auth.uid() = id);

-- Création de la fonction pour créer automatiquement un profil pour chaque nouvel utilisateur
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

-- Création du déclencheur pour appeler la fonction après l'inscription d'un nouvel utilisateur
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Création de la table reports
create table reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  type text not null,
  content text,
  format text default 'text',
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- Activer la RLS pour la table reports
alter table reports enable row level security;

-- Créer des politiques RLS pour reports
create policy "Les utilisateurs peuvent voir leurs propres rapports" 
on reports for select 
using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs propres rapports" 
on reports for insert 
with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent mettre à jour leurs propres rapports" 
on reports for update 
using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs propres rapports" 
on reports for delete 
using (auth.uid() = user_id); 