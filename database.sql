
-- SoulSpeak Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Confessions Table
CREATE TABLE IF NOT EXISTS public.confessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    audio_url TEXT NOT NULL,
    mood_tag TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,
    listens_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions Table
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'stay_strong', 'feel_same', 'sending_love', 'not_alone'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(confession_id, user_id, reaction_type)
);

-- Comments Table (Voice Replies)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Confessions Policies
CREATE POLICY "Anyone can read confessions" ON public.confessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create confessions" ON public.confessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own confessions" ON public.confessions FOR UPDATE USING (auth.uid() = user_id);

-- Reactions Policies
CREATE POLICY "Anyone can read reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Bucket Setup (Instructions for user)
-- Create a bucket named 'audio' and set public access.
