
# SoulSpeak - Anonymous Voice Confessions

SoulSpeak is a safe, anonymous space where people can express their feelings and life struggles through short voice recordings.

## Features
- **Anonymous Voice Confessions**: Record and share your thoughts without revealing your identity.
- **Supportive Reactions**: React to others' confessions with supportive messages like "Stay Strong".
- **Voice Comments**: Reply to confessions using your own voice.
- **Trending Feed**: See what's resonating with the community.
- **Personal Profile**: Track your own shared echoes and the support you've received.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide React
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Audio**: Web Audio API

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the SQL schema found in `database.sql` in the Supabase SQL Editor.
3. Create a storage bucket named `audio` and set it to **Public**.
4. Go to **Project Settings > API** and get your `Project URL` and `anon public` key.

### 2. Environment Variables
1. In AI Studio, go to **Settings > Environment Variables**.
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key.

### 3. Run the App
The app should automatically start in the preview. If not, ensure the environment variables are set correctly and refresh.

## Security
- Audio files are stored securely in Supabase Storage.
- Database access is protected by Row Level Security (RLS) policies.
- Anonymous mode is enabled by default to protect user privacy.
