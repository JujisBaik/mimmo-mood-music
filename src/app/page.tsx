'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Tone from 'tone';

type Mood = 'happy' | 'sad' | 'angry' | 'excited' | 'chill';

const moodOptions: Array<{ value: Mood; label: string; tone: string }> = [
  { value: 'happy', label: 'Happy', tone: 'from-yellow-300 to-orange-300' },
  { value: 'sad', label: 'Sad', tone: 'from-blue-300 to-indigo-400' },
  { value: 'angry', label: 'Angry', tone: 'from-red-400 to-orange-500' },
  { value: 'excited', label: 'Excited', tone: 'from-fuchsia-300 to-pink-400' },
  { value: 'chill', label: 'Chill', tone: 'from-emerald-300 to-cyan-300' },
];

const lyricsTemplates: Record<Mood, string[]> = {
  happy: [
    'Aku bahagia hari ini!\nMatahari bersinar terang.\nMood lagi naik, hati ikut nyanyi.\nSenyum dulu, masalah nanti.',
    'Hari ini lucu banget.\nLangit kayak ngasih high five.\nKita jalan pelan tapi happy.\nYang penting vibes-nya hidup.',
  ],
  sad: [
    'Hari ini agak sendu.\nHujan kecil di dalam hati.\nTapi aku masih jalan pelan.\nBesok mungkin lebih manis.',
    'Sedih datang tanpa permisi.\nAku duduk dulu, tarik napas.\nKalau malam terasa berat.\nPagi tetap punya pintu.',
  ],
  angry: [
    'Aku lagi panas hari ini.\nSemua tombol kayak kepencet.\nTarik napas, jangan meledak.\nBeat-nya keras, kepala tetap dingin.',
    'Kenapa ribet banget sih?\nEnergi merah naik ke ubun.\nAku ubah marah jadi rhythm.\nBiar chaos jadi lagu.',
  ],
  excited: [
    'Aku semangat banget hari ini.\nKaki pengen lompat duluan.\nIde datang nabrak pintu.\nGas terus, volume naik.',
    'Energi penuh, mata nyala.\nRencana banyak, waktu ngejar.\nKalau dunia bilang tunggu.\nAku bilang mulai sekarang.',
  ],
  chill: [
    'Santai dulu hari ini.\nKopi pelan, napas panjang.\nTidak semua harus dikejar.\nKadang hidup cukup didengar.',
    'Pelan-pelan aja dulu.\nLangit sore jadi teman.\nBeat kecil, hati adem.\nLife is good kalau dinikmati.',
  ],
};

const notesByMood: Record<Mood, string[]> = {
  happy: ['C4', 'E4', 'G4', 'B4', 'C5', 'E5'],
  sad: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  angry: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3'],
  excited: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
  chill: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'],
};

const voiceSettings: Record<Mood, { rate: number; pitch: number }> = {
  happy: { rate: 1.05, pitch: 1.15 },
  sad: { rate: 0.88, pitch: 0.82 },
  angry: { rate: 1.08, pitch: 0.72 },
  excited: { rate: 1.18, pitch: 1.18 },
  chill: { rate: 0.92, pitch: 0.95 },
};

export default function Home() {
  const [mood, setMood] = useState<Mood>('happy');
  const [generatedMood, setGeneratedMood] = useState<Mood>('happy');
  const [lyrics, setLyrics] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!speechSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (!selectedVoice && availableVoices.length > 0) {
        const preferred =
          availableVoices.find((voice) => voice.lang.toLowerCase().startsWith('id')) ||
          availableVoices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
          availableVoices[0];
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice, speechSupported]);

  const selectedMood = useMemo(
    () => moodOptions.find((option) => option.value === mood) || moodOptions[0],
    [mood],
  );

  const displayedMood = useMemo(
    () => moodOptions.find((option) => option.value === generatedMood) || moodOptions[0],
    [generatedMood],
  );

  const handleMoodChange = (nextMood: Mood) => {
    setMood(nextMood);
    setLyrics('');
    stopVoice();
  };

  const speakLyrics = (text = lyrics, useSelectedVoice = true) => {
    if (!speechSupported || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = useSelectedVoice ? voices.find((item) => item.name === selectedVoice) : undefined;
    const settings = voiceSettings[mood];

    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'id-ID';
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (useSelectedVoice) {
        window.setTimeout(() => speakLyrics(text, false), 80);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const generateMusic = async () => {
    setIsLoading(true);
    stopVoice();

    try {
      const moodLyrics = lyricsTemplates[mood] || lyricsTemplates.happy;
      const selectedLyrics = moodLyrics[Math.floor(Math.random() * moodLyrics.length)];
      setLyrics(selectedLyrics);
      setGeneratedMood(mood);

      const synth = new Tone.Synth().toDestination();
      await Tone.start();

      const now = Tone.now();
      const selectedNotes = notesByMood[mood] || notesByMood.happy;

      selectedNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, '8n', now + index * 0.3);
      });

      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), selectedNotes.length * 300);

      if (autoSpeak) {
        window.setTimeout(() => speakLyrics(selectedLyrics), 250);
      }
    } catch (error) {
      console.error('Error generating music:', error);
      setLyrics('Error generating music. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#581c87,#111827_42%,#020617)] px-5 py-8 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-pink-200">
            MiMo Mood Music
          </div>
          <h1 className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
            Mood Song Generator
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-pink-100/85 sm:text-lg">
            Pilih mood, generate lirik, mainkan melody, terus biarin browser bacain liriknya.
          </p>
        </header>

        <section className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-pink-100">
            Pilih Mood
          </div>

          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMoodChange(option.value)}
                className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                  mood === option.value
                    ? `border-white/70 bg-gradient-to-br ${option.tone} text-slate-950 shadow-lg`
                    : 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-pink-100">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(event) => setSelectedVoice(event.target.value)}
                disabled={!speechSupported || voices.length === 0}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-3 text-sm font-semibold text-white outline-none"
              >
                {!speechSupported && <option>Voice not supported</option>}
                {speechSupported && voices.length === 0 && <option>Loading voices...</option>}
                {voices.map((voice) => (
                  <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 self-end rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black">
              <input
                checked={autoSpeak}
                onChange={(event) => setAutoSpeak(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 accent-pink-400"
              />
              Auto voice
            </label>
          </div>

          <button
            onClick={generateMusic}
            disabled={isLoading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-400 px-8 py-4 text-lg font-black text-slate-950 shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Generating...' : `Generate ${selectedMood.label} Song`}
          </button>
        </section>

        {lyrics && (
          <section className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-yellow-200">
                Lyrics for {displayedMood.label}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => speakLyrics()}
                  disabled={!speechSupported || isSpeaking}
                  className="rounded-xl border border-emerald-300/40 bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSpeaking ? 'Speaking...' : 'Play Voice'}
                </button>
                <button
                  onClick={stopVoice}
                  disabled={!speechSupported || !isSpeaking}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Stop
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/35 p-5 font-mono text-base leading-relaxed text-pink-50 sm:text-lg">
              {lyrics}
            </div>
          </section>
        )}

        {(isPlaying || isSpeaking) && (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm font-black text-pink-100">
            {isPlaying ? 'Melody playing' : 'Voice playing'}
          </div>
        )}

        <footer className="text-center text-sm font-semibold text-pink-100/75">
          Free voice uses your browser speech engine. No paid voice API needed.
        </footer>
      </div>
    </main>
  );
}
