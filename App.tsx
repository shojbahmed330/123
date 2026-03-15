
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './src/supabase';
import { 
  Mic, 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  User, 
  Home, 
  TrendingUp, 
  LogOut, 
  Send,
  Shield,
  Clock,
  Volume2,
  PlusCircle,
  X
} from 'lucide-react';

// --- Types ---
interface Confession {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  mood_tag: string;
  is_anonymous: boolean;
  listens_count: number;
  created_at: string;
  reactions?: any[];
  comments_count?: number;
}

// --- Components ---

const AudioPlayer = ({ src }: { src: string }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-pink-600 rounded-full text-white hover:scale-105 transition-transform"
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
      </button>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full bg-pink-500 transition-all duration-300 ${playing ? 'w-full' : 'w-0'}`}></div>
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

const ConfessionCard = ({ confession, onReact }: { confession: Confession, onReact: (id: string, type: string) => void, key?: any }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-pink-500/20 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{confession.title || 'Untitled Confession'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-500/10 px-2 py-1 rounded-lg">
              {confession.mood_tag || 'Neutral'}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Clock size={10} /> {new Date(confession.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-bold uppercase">
          <Volume2 size={12} /> {confession.listens_count}
        </div>
      </div>

      <AudioPlayer src={confession.audio_url} />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onReact(confession.id, 'stay_strong')}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-pink-500 transition-colors"
          >
            <Heart size={20} />
            <span className="text-[8px] font-black uppercase">Stay Strong</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-[8px] font-black uppercase">Comments</span>
          </button>
        </div>
        <div className="text-[10px] font-black uppercase text-zinc-600">
          {confession.is_anonymous ? 'Anonymous Soul' : 'Shared Soul'}
        </div>
      </div>
    </div>
  );
};

const Recorder = ({ onUpload }: { onUpload: (blob: Blob, title: string, mood: string, anon: boolean) => void }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('Struggling');
  const [isAnon, setIsAnon] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Speak Your <span className="text-pink-500">Truth</span></h2>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Your voice is safe here.</p>
      </div>

      <div className="flex justify-center py-8">
        {!audioBlob ? (
          <button 
            onClick={recording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${recording ? 'bg-red-500 animate-pulse' : 'bg-pink-600 hover:scale-105'}`}
          >
            {recording ? <X size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
          </button>
        ) : (
          <div className="w-full space-y-4">
            <AudioPlayer src={URL.createObjectURL(audioBlob)} />
            <button onClick={() => setAudioBlob(null)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white w-full text-center">Record Again</button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Title (Optional)" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-pink-500 outline-none"
        />
        <select 
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-pink-500 outline-none"
        >
          <option>Struggling</option>
          <option>Heartbroken</option>
          <option>Anxious</option>
          <option>Hopeful</option>
          <option>Lonely</option>
        </select>
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Post Anonymously</span>
          <button 
            onClick={() => setIsAnon(!isAnon)}
            className={`w-12 h-6 rounded-full transition-all relative ${isAnon ? 'bg-pink-600' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnon ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      <button 
        disabled={!audioBlob}
        onClick={() => audioBlob && onUpload(audioBlob, title, mood, isAnon)}
        className="w-full py-5 bg-pink-600 disabled:bg-zinc-800 rounded-3xl font-black uppercase text-xs tracking-[0.2em] text-white shadow-xl shadow-pink-600/20 active:scale-95 transition-all"
      >
        Release into the world
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'feed' | 'record' | 'profile'>('feed');
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchConfessions();

    return () => subscription.unsubscribe();
  }, []);

  const fetchConfessions = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('confessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setConfessions(data);
  };

  const handleUpload = async (blob: Blob, title: string, mood: string, anon: boolean) => {
    if (!supabase) return;
    if (!user) return alert("Please login to share.");

    const fileName = `${user.id}/${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, blob);

    if (uploadError) return console.error(uploadError);

    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('confessions').insert({
      user_id: user.id,
      title,
      audio_url: publicUrl,
      mood_tag: mood,
      is_anonymous: anon
    });

    if (!dbError) {
      setView('feed');
      fetchConfessions();
    }
  };

  const handleLogin = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error(error);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div></div>;

  if (!supabase) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter">Configuration <span className="text-red-500">Required</span></h1>
        <p className="text-zinc-500 text-sm max-w-xs uppercase font-bold tracking-widest leading-relaxed">
          Please set your Supabase credentials in the environment variables to start using SoulSpeak.
        </p>
        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5 text-left w-full max-w-sm font-mono text-[10px] text-zinc-400">
          VITE_SUPABASE_URL<br/>
          VITE_SUPABASE_ANON_KEY
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 pb-24">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-600 rounded-xl flex items-center justify-center text-white">
            <Volume2 size={20} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Soul<span className="text-pink-600">Speak</span></h1>
        </div>
        {!user ? (
          <button onClick={handleLogin} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Login</button>
        ) : (
          <button onClick={() => supabase?.auth.signOut()} className="p-2 text-zinc-500 hover:text-white"><LogOut size={20} /></button>
        )}
      </header>

      <main className="max-w-md mx-auto p-6">
        {view === 'feed' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Recent Echoes</h2>
              <TrendingUp size={16} className="text-zinc-700" />
            </div>
            {confessions.map(c => (
              <ConfessionCard key={c.id} confession={c} onReact={(id, type) => console.log(id, type)} />
            ))}
          </div>
        )}

        {view === 'record' && (
          <Recorder onUpload={handleUpload} />
        )}

        {view === 'profile' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-pink-600/20 rounded-[2.5rem] mx-auto flex items-center justify-center text-pink-500">
                <User size={48} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">{user?.email?.split('@')[0] || 'Soul'}</h2>
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] mt-1">SoulSpeak Member</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 text-center">
                <div className="text-2xl font-black text-white">0</div>
                <div className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mt-1">Confessions</div>
              </div>
              <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 text-center">
                <div className="text-2xl font-black text-white">0</div>
                <div className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mt-1">Reactions</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center z-50">
        <button 
          onClick={() => setView('feed')}
          className={`flex-1 flex flex-col items-center py-3 rounded-3xl transition-all ${view === 'feed' ? 'bg-pink-600 text-white' : 'text-zinc-500'}`}
        >
          <Home size={20} />
          <span className="text-[8px] font-black uppercase mt-1">Feed</span>
        </button>
        <button 
          onClick={() => setView('record')}
          className={`flex-1 flex flex-col items-center py-3 rounded-3xl transition-all ${view === 'record' ? 'bg-pink-600 text-white' : 'text-zinc-500'}`}
        >
          <PlusCircle size={20} />
          <span className="text-[8px] font-black uppercase mt-1">Speak</span>
        </button>
        <button 
          onClick={() => setView('profile')}
          className={`flex-1 flex flex-col items-center py-3 rounded-3xl transition-all ${view === 'profile' ? 'bg-pink-600 text-white' : 'text-zinc-500'}`}
        >
          <User size={20} />
          <span className="text-[8px] font-black uppercase mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
