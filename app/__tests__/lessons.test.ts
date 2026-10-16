// Validates whatever lesson data is in src/data (stand-ins or the real files synced from
// content/lessons) against the contract, and plays every class through the engine.
import { LESSONS } from '@/data/lessons';
import songsJson from '@/data/songs.json';
import { LessonEngine } from '@/lib/timeline';
import { karaokeLines } from '@/lib/music';
import type { Song } from '@/types';

const songs = songsJson as unknown as Song[];

describe('lesson data matches the contract', () => {
  it('has a lesson for every song', () => {
    for (const s of songs) expect(LESSONS[s.id]).toBeDefined();
  });

  it('6-12 classes per song, 180-300 s each, segments sum to the class, last is concert', () => {
    for (const lesson of Object.values(LESSONS)) {
      expect(lesson.classes.length).toBeGreaterThanOrEqual(6);
      expect(lesson.classes.length).toBeLessThanOrEqual(12);
      expect(lesson.classes[lesson.classes.length - 1].type).toBe('concert');
      lesson.classes.forEach((c, i) => {
        expect(c.index).toBe(i + 1);
        expect(c.durationSec).toBeGreaterThanOrEqual(180);
        expect(c.durationSec).toBeLessThanOrEqual(300);
        expect(c.segments.reduce((a, s) => a + s.durationSec, 0)).toBe(c.durationSec);
      });
    }
  });
});

describe('every class plays through the interactive engine', () => {
  it('finishes with 3 stars for a child who always taps the lit key, in about the video length', () => {
    for (const lesson of Object.values(LESSONS)) {
      const song = songs.find((s) => s.id === lesson.songId)!;
      for (const cls of lesson.classes) {
        const eng = new LessonEngine(cls, { songBpm: song.bpm, splitMidi: 66 });
        let elapsed = 0;
        let steps = 0;
        while (!eng.finished && steps++ < 200000) {
          if (eng.waitingFor) eng.press(eng.waitingFor);
          const seg = eng.segment;
          if (seg.kind === 'beat' || seg.kind === 'together') eng.press(eng.litKeys()[0] ?? 'C4');
          if (seg.kind === 'high_low') eng.press(seg.target === 'low' ? 'C4' : 'C5');
          eng.tick(0.05);
          elapsed += 0.05;
        }
        expect(eng.finished).toBe(true);
        const r = eng.result();
        expect(r.completed).toBe(true);
        expect(r.stars).toBeGreaterThanOrEqual(2);
        if (eng.stats.yourTurnTotal > 0) expect(r.stars).toBe(3);
        // Never longer than the video; your_turn tails may end a little early.
        // The simulated child answers one tick (0.05 s) after each prompt, so allow that per your_turn note.
        const promptedNotes = cls.segments
          .filter((s) => s.kind === 'your_turn')
          .reduce((a, s) => a + (s.notes?.filter((n) => !n.rest).length ?? 0), 0);
        expect(elapsed).toBeLessThanOrEqual(cls.durationSec + 1 + 0.05 * promptedNotes);
        expect(elapsed).toBeGreaterThan(cls.durationSec * 0.8);
      }
    }
  });

  it('every note segment with lyric lines yields karaoke words', () => {
    for (const lesson of Object.values(LESSONS)) {
      const song = songs.find((s) => s.id === lesson.songId)!;
      for (const cls of lesson.classes) {
        for (const seg of cls.segments) {
          if (!seg.lines?.length || !seg.notes) continue;
          const lines = karaokeLines(seg.notes, song.phrases, seg.lines);
          expect(lines.length).toBeGreaterThan(0);
          expect(lines[0].words[0].text.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
