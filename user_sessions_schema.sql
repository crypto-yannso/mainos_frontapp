-- Création de la table user_sessions
create table public.user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) not null,
  ip_address text,
  user_agent text,
  last_active timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb
);

-- Activer la RLS (Row Level Security) pour la table user_sessions
alter table public.user_sessions enable row level security;

-- Créer des politiques RLS pour user_sessions
-- Politique pour la sélection (lecture)
create policy "Les utilisateurs peuvent voir leurs propres sessions"
on public.user_sessions for select
using (auth.uid() = user_id);

-- Politique pour la mise à jour
create policy "Les utilisateurs peuvent mettre à jour leurs propres sessions"
on public.user_sessions for update
using (auth.uid() = user_id);

-- Politique pour l'insertion
create policy "Les utilisateurs peuvent insérer leurs propres sessions"
on public.user_sessions for insert
with check (auth.uid() = user_id);

-- Politique pour la suppression
create policy "Les utilisateurs peuvent supprimer leurs propres sessions"
on public.user_sessions for delete
using (auth.uid() = user_id);

-- Créer un index pour améliorer les performances des requêtes
create index idx_user_sessions_user_id on public.user_sessions(user_id);
create index idx_user_sessions_is_active on public.user_sessions(is_active);

-- Ajouter des commentaires pour la documentation
comment on table public.user_sessions is 'Enregistre les sessions de connexion des utilisateurs';
comment on column public.user_sessions.id is 'Identifiant unique de la session';
comment on column public.user_sessions.user_id is 'Identifiant de l''utilisateur associé à la session';
comment on column public.user_sessions.ip_address is 'Adresse IP de l''utilisateur lors de la connexion';
comment on column public.user_sessions.user_agent is 'Agent utilisateur du navigateur';
comment on column public.user_sessions.last_active is 'Dernière activité de l''utilisateur dans cette session';
comment on column public.user_sessions.created_at is 'Date de création de la session';
comment on column public.user_sessions.is_active is 'Indique si la session est toujours active';
comment on column public.user_sessions.metadata is 'Métadonnées supplémentaires de la session'; 