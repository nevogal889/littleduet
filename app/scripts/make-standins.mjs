#!/usr/bin/env node
// Builds STAND-IN lesson files (contract-shaped) for songs that have no real lesson yet,
// so the app can be developed before content/lessons/*.json exists.
//   node scripts/make-standins.mjs            -> src/data/lessons/<songId>.json (+ index.ts)
//   node scripts/make-standins.mjs --videos[=songA,songB] -> also public/media/<songId>/<classId>.mp4/.webm/.jpg via ffmpeg
// Real lessons always win: run scripts/sync-content.mjs after the curriculum teammate ships.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { CONTENT, DATA, DATA_LESSONS, MEDIA, ROOT, readJson, sourceSongsPath, writeLessonIndex } from './lib/paths.mjs';

const videosArg = process.argv.find((x) => x.startsWith('--videos'));
const withVideos = !!videosArg;
// --videos (every class without a real video) or --videos=songA,songB (only those songs)
const videoOnly = videosArg?.includes('=') ? new Set(videosArg.split('=')[1].split(',')) : null;
const songs = readJson(sourceSongsPath());
fs.mkdirSync(DATA_LESSONS, { recursive: true });
fs.writeFileSync(path.join(DATA, 'songs.json'), JSON.stringify(songs, null, 2));

const pitched = (notes) => notes.filter((n) => !n.rest);
const beats = (notes) => notes.reduce((a, n) => a + n.d, 0);
const secs = (notes, bpm) => (beats(notes) * 60) / bpm;
const r = (v) => Math.max(1, Math.round(v));

function noteSeg(kind, caption, notes, bpm, extra = {}) {
  let d = secs(notes, bpm) + 2;
  if (kind === 'your_turn') d += (pitched(notes).length * 60) / bpm; // video pauses ~1 beat per note
  return { kind, caption, notes, bpm, durationSec: r(d), ...extra };
}

function buildClass(song, index, spec) {
  const id = `${song.id}-c${String(index).padStart(2, '0')}`;
  const head = [
    { kind: 'title', caption: song.title, durationSec: 5 },
    { kind: 'say', caption: spec.intro, parentCue: spec.cue, durationSec: 8 },
  ];
  const tail = [{ kind: 'praise', caption: spec.praise ?? 'Wonderful playing!', durationSec: 6 }];
  const block = spec.block;
  let body = [...block];
  const total = (segs) => segs.reduce((a, s) => a + s.durationSec, 0);
  let guard = 0;
  while (total([...head, ...body, ...tail]) < 180 && guard++ < 40) {
    body.push({ kind: 'say', caption: 'One more time!', durationSec: 4 }, ...block);
  }
  // Trim to <= 300 s.
  while (total([...head, ...body, ...tail]) > 300 && body.length > 1) body.pop();
  let segments = [...head, ...body, ...tail];
  const sum = total(segments);
  if (sum < 180) segments.splice(segments.length - 1, 0, { kind: 'say', caption: 'Take a bow!', durationSec: 180 - sum });
  return {
    id,
    index,
    title: spec.title,
    goal: spec.goal,
    type: spec.type,
    durationSec: total(segments),
    parentTip: spec.tip,
    video: `${song.id}/${id}.mp4`,
    thumb: `${song.id}/${id}.jpg`,
    segments,
  };
}

function curriculum(song) {
  const bpm = song.bpm;
  const all = song.phrases.flatMap((p) => p.notes);
  const slow = Math.round(bpm * 0.8);
  const ph = song.phrases;
  const pairs = [];
  for (let i = 0; i < ph.length; i += 2) pairs.push(ph.slice(i, i + 2));
  const specs = [];
  const listen = {
    type: 'listen', title: 'Listen and sway', goal: 'Hear the whole song and move to the beat',
    intro: "Let's listen together", cue: 'Sit side by side at the piano',
    tip: 'Sway side to side while the song plays. No playing yet.',
    block: [noteSeg('listen', 'Listen to the song', all, bpm)],
  };
  const concert = {
    type: 'concert', title: 'Concert time', goal: 'Play the whole song together',
    intro: 'Time for a concert!', cue: 'Invite someone to listen',
    tip: 'Play the whole song together. Clap and bow at the end.',
    praise: 'Bravo! What a concert!',
    block: [noteSeg('together', 'Play it together', all, bpm), noteSeg('your_turn', 'Your turn!', all, slow)],
  };
  const g = song.ageGroup;
  specs.push(listen);
  if (g === '2-3' || g === '3-4') {
    specs.push({
      type: 'beat', title: 'Tap the beat', goal: 'Tap any key on every beat',
      intro: 'Tap, tap, tap with the music', cue: 'Grown-up plays the tune, child taps the beat',
      tip: 'Any key is fine. Tap along with each beat.',
      block: [noteSeg('beat', 'Tap on every beat', all, bpm)],
    });
    specs.push({
      type: 'high-low', title: 'High and low', goal: 'Hear the bird up high and the bear down low',
      intro: 'Bird sings high, bear sings low', cue: 'Point up for high, down for low',
      tip: 'High notes are on the right, low notes on the left.',
      block: [
        { kind: 'high_low', caption: 'Play a high note like a bird', target: 'high', durationSec: 12 },
        { kind: 'high_low', caption: 'Play a low note like a bear', target: 'low', durationSec: 12 },
      ],
    });
  }
  if (g === '3-4' || g === '2-3') {
    const special = ph.map((p) => pitched(p.notes).slice(-1)[0]).filter(Boolean);
    specs.push({
      type: 'special-note', title: 'The special note', goal: 'Play one special note on cue',
      intro: 'Find the special note', cue: 'Point to the lit key together',
      tip: 'Your child plays only the last note of each line.',
      block: [noteSeg('demo', 'Watch the special note', special, slow), noteSeg('your_turn', 'Your turn!', special, slow)],
    });
    const echo = pitched(ph[0].notes).slice(0, 3);
    specs.push({
      type: 'echo', title: 'Echo game', goal: 'Copy three notes back',
      intro: 'I play, you copy', cue: 'Grown-up plays, child copies',
      tip: 'Short and sweet: three notes, then copy.',
      block: [noteSeg('demo', 'Listen to three notes', echo, slow), noteSeg('your_turn', 'Copy me!', echo, slow)],
    });
    specs.push({
      type: 'together', title: 'Play together', goal: 'Play along with the whole song',
      intro: 'Now we play together', cue: 'Play the tune while your child joins in',
      tip: 'Keep going even when notes are missed. Fun first.',
      block: [noteSeg('together', 'Play it together', all, bpm)],
    });
  } else {
    specs.push({
      type: 'hand-position', title: 'Hand on the keys', goal: 'Find the starting key and finger numbers',
      intro: 'Thumb on the first note', cue: 'Help place the right hand',
      tip: 'Thumb is finger 1. Rest each finger on its own key.',
      block: [noteSeg('demo', 'Fingers 1 2 3 4 5', pitched(ph[0].notes).slice(0, 5), slow), noteSeg('your_turn', 'Your turn!', pitched(ph[0].notes).slice(0, 5), slow)],
    });
    pairs.forEach((pair, i) => {
      const notes = pair.flatMap((p) => p.notes);
      specs.push({
        type: 'phrase', title: `Line ${i + 1}: ${pair[0].lyric}`, goal: 'Learn one part of the song',
        intro: 'Watch, then you try', cue: 'Sing the words while your child plays',
        tip: 'Go slowly. Try it twice, then move on.',
        block: [noteSeg('demo', 'Watch the lights', notes, slow), noteSeg('your_turn', 'Your turn!', notes, slow)],
      });
    });
    specs.push({
      type: 'put-together', title: 'Put it together', goal: 'Play the whole song slowly',
      intro: 'All the parts in a row', cue: 'Point to each next key',
      tip: 'Slow is great. Speed comes later.',
      block: [noteSeg('your_turn', 'Your turn!', all, slow)],
    });
    specs.push({
      type: 'play-along', title: 'Play along', goal: 'Play with the music at full speed',
      intro: 'Play with the music', cue: 'Count 1 2 3 4 before you start',
      tip: 'Keep going even when a note is missed.',
      block: [noteSeg('together', 'Play along', all, bpm)],
    });
  }
  specs.push(concert);
  return specs.slice(0, 12).map((s, i) => buildClass(song, i + 1, s));
}

let made = 0;
for (const song of songs) {
  const real = path.join(CONTENT, 'lessons', `${song.id}.json`);
  const dest = path.join(DATA_LESSONS, `${song.id}.json`);
  if (fs.existsSync(real)) {
    fs.copyFileSync(real, dest);
    continue;
  }
  const lesson = { songId: song.id, standIn: true, classes: curriculum(song) };
  fs.writeFileSync(dest, JSON.stringify(lesson, null, 1));
  made++;
}
// Stand-in videos for every class that has no real video in public/media yet.
if (withVideos) {
  for (const song of songs) {
    const lessonFile = path.join(DATA_LESSONS, `${song.id}.json`);
    if (videoOnly && !videoOnly.has(song.id)) continue;
    if (fs.existsSync(lessonFile)) renderStandInVideos(song, readJson(lessonFile));
  }
  process.stdout.write('\n');
}
const n = writeLessonIndex();
console.log(`songs: ${songs.length}, stand-in lessons written: ${made}, lesson files indexed: ${n}`);

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, '\u2019').replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/%/g, '\\%');
}

function renderStandInVideos(song, lesson) {
  const font = path.join(ROOT, 'video', 'assets', 'gfonts', 'ofl', 'dmsans', 'DMSans[opsz,wght].ttf');
  const fontArg = fs.existsSync(font) ? `fontfile='${font}':` : '';
  for (const c of lesson.classes) {
    const dir = path.join(MEDIA, song.id);
    fs.mkdirSync(dir, { recursive: true });
    const base = path.join(dir, c.id);
    if (fs.existsSync(`${base}.mp4`)) continue; // real (or earlier stand-in) video present
    let t = 0;
    const draws = [
      `drawtext=${fontArg}text='${esc(song.title)}':fontcolor=0x1E2A3A:fontsize=22:x=(w-text_w)/2:y=20`,
      `drawtext=${fontArg}text='Class ${c.index}  ${esc(c.title).slice(0, 40)}':fontcolor=0x3D4C8C:fontsize=16:x=(w-text_w)/2:y=52`,
      `drawtext=${fontArg}text='STAND-IN VIDEO  %{pts\\:hms}':fontcolor=0x1E2A3A:fontsize=12:x=10:y=h-22`,
    ];
    for (const s of c.segments) {
      draws.push(
        `drawtext=${fontArg}text='${esc(s.caption).slice(0, 34)}':fontcolor=0xF26B4F:fontsize=26:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t\\,${t}\\,${t + s.durationSec})'`,
      );
      t += s.durationSec;
    }
    const vf = draws.join(',');
    const input = ['-f', 'lavfi', '-i', `color=c=0xEEF3F7:s=480x270:r=6:d=${c.durationSec}`];
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...input, '-vf', vf, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${base}.mp4`]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...input, '-vf', vf, '-c:v', 'libvpx', '-b:v', '120k', '-deadline', 'realtime', '-cpu-used', '8', `${base}.webm`]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '6', '-i', `${base}.mp4`, '-frames:v', '1', '-q:v', '4', `${base}.jpg`]);
    process.stdout.write('.');
  }
}
