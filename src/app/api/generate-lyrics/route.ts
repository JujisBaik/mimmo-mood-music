// API endpoint for lyrics generation (optional MiMo integration)
// Currently using static templates for FREE operation
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mood } = await request.json();

    // Lyrics templates for each mood (absurd & funny)
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

    // Select random lyrics for the mood
    const moodLyrics = lyricsTemplates[mood] || lyricsTemplates.happy;
    const selectedLyrics = moodLyrics[Math.floor(Math.random() * moodLyrics.length)];

    return NextResponse.json({
      lyrics: selectedLyrics
    });
  } catch (error) {
    console.error('Error generating lyrics:', error);
    return NextResponse.json({
      lyrics: 'Error generating lyrics. Please try again!'
    }, { status: 500 });
  }
}