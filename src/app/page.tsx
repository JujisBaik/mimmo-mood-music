'use client';

import { useState } from 'react';
import * as Tone from 'tone';

export default function Home() {
  const [mood, setMood] = useState('happy');
  const [lyrics, setLyrics] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Lyrics templates (absurd & funny) - NO API NEEDED!
  const lyricsTemplates: Record<string, string[]> = {
    happy: [
      "Aku bahagia hari ini! ☀️\nMatahari bersinar terang!\nBurung-burung berkicau riang!\nHidup itu indah, coba deh senyum! 😄",
      "Senyum-senyum aja hari ini!\nMasalah biarlah berlalu!\nKita happy terus saja!\nGak peduli apapun! 😎"
    ],
    sad: [
      "Hari ini sedih banget... 😢\nHujan turun di hati...\nMengapa dunia begini?\nAku ingin menangis saja...",
      "Kenapa ya hidup begini?\nSedih terus akhir-akhir ini...\nMungkin esok lebih baik?\nAtau malah lebih buruk? 🥲"
    ],
    angry: [
      "Aku marah banget hari ini! 😡\nSemua bikin gregetan!\nKenapa susah banget sih?\nGak bisa kontrol diri!",
      "INI KENAPA SIH?! 😤\nSemua bikin emosi!\nMau teriak keras!\nTapi gak bisa... 🤬"
    ],
    excited: [
      "WHOA! AKU SEMANGAT BANGET! 🤩\nHari ini keren banget!\nMau lompat-lompat!\nGak sabar nunggu besok!",
      "YEAH! HARI INI KEREN! ✨\nMau lari-lari!\nMau teriak-teriak!\nENERGI MAXIMUM! ⚡"
    ],
    chill: [
      "Santai aja hari ini... 😎\nGak mau mikir ribet.\nDuduk-duduk aja.\nNikmatin hidup perlahan.",
      "Hmmm... santai saja...\nGak perlu buru-buru...\nNikmatin momen...\nLife is good~ ☕"
    ]
  };

  const generateMusic = async () => {
    setIsLoading(true);
    
    try {
      // NO API CALL - Generate lyrics from template directly!
      const moodLyrics = lyricsTemplates[mood] || lyricsTemplates.happy;
      const selectedLyrics = moodLyrics[Math.floor(Math.random() * moodLyrics.length)];
      setLyrics(selectedLyrics);

      // Generate music based on mood
      const synth = new Tone.Synth().toDestination();
      await Tone.start();
      
      const now = Tone.now();
      
      const notes = {
        happy: ['C4', 'E4', 'G4', 'B4', 'C5', 'E5'],
        sad: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
        angry: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3'],
        excited: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
        chill: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5']
      };
      
      const selectedNotes = notes[mood as keyof typeof notes] || notes.happy;
      
      // Play the melody
      selectedNotes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '8n', now + i * 0.3);
      });
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), selectedNotes.length * 300);
      
    } catch (error) {
      console.error('Error generating music:', error);
      setLyrics('Error generating music. Please try again!');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-600 text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
            🎵 MiMo Mood Music Generator
          </h1>
          <p className="text-xl text-pink-200">
            Bikin lagu sesuai mood kamu — 100% FREE! 🆓
          </p>
        </div>

        {/* Mood Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <label className="block text-lg mb-4 font-medium">
            Pilih Mood Kamu:
          </label>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              { value: 'happy', emoji: '😊', label: 'Happy' },
              { value: 'sad', emoji: '😢', label: 'Sad' },
              { value: 'angry', emoji: '😠', label: 'Angry' },
              { value: 'excited', emoji: '🤩', label: 'Excited' },
              { value: 'chill', emoji: '😎', label: 'Chill' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  mood === option.value
                    ? 'bg-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateMusic}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full text-lg hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Generating...' : '🎶 Generate Music!'}
          </button>
        </div>

        {/* Lyrics Display */}
        {lyrics && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-yellow-300">
              📝 Lyrics for {mood} mood:
            </h2>
            <div className="bg-black/30 rounded-xl p-6 text-left whitespace-pre-wrap font-mono text-lg leading-relaxed">
              {lyrics}
            </div>
          </div>
        )}

        {/* Now Playing Indicator */}
        {isPlaying && (
          <div className="mt-6 animate-pulse">
            <span className="text-xl">🎵 Now Playing...</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-pink-200 text-sm">
          100% FREE • Built with love by Jumjis 🐣
        </div>
      </div>
    </div>
  );
}