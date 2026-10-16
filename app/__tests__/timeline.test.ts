import { LessonEngine, noteSchedule, segmentAt, segmentStarts } from '@/lib/timeline';
import { makeClass, seg } from './fixtures';

const notes3 = [
  { p: 'E4', d: 1, s: 'Hot' },
  { p: 'D4', d: 1, s: 'cross' },
  { rest: true as const, d: 1 },
  { p: 'C4', d: 2, s: 'buns' },
];

describe('segment timing', () => {
  const cls = makeClass('hcb', 2, 30, [seg('title', 5), seg('demo', 10, { notes: notes3, bpm: 60 }), seg('praise', 15)]);

  it('computes cumulative segment start times', () => {
    expect(segmentStarts(cls)).toEqual([0, 5, 15]);
  });

  it('finds the segment and offset for a class time', () => {
    expect(segmentAt(cls, 0)).toEqual({ index: 0, offset: 0 });
    expect(segmentAt(cls, 7.5)).toEqual({ index: 1, offset: 2.5 });
    expect(segmentAt(cls, 29)).toEqual({ index: 2, offset: 14 });
    expect(segmentAt(cls, 99)).toEqual({ index: 2, offset: 15 });
  });

  it('schedules notes by beats at the segment bpm, skipping rests', () => {
    const sched = noteSchedule(cls.segments[1], 80);
    expect(sched.map((n) => n.p)).toEqual(['E4', 'D4', 'C4']);
    expect(sched.map((n) => n.startSec)).toEqual([0, 1, 3]);
    expect(sched[2].durSec).toBe(2);
  });

  it('falls back to the song bpm when the segment has none', () => {
    const sched = noteSchedule({ kind: 'listen', caption: '', durationSec: 10, notes: notes3 }, 120);
    expect(sched[1].startSec).toBe(0.5);
  });
});

describe('engine playback', () => {
  it('plays demo notes automatically as time passes and moves through segments', () => {
    const cls = makeClass('hcb', 2, 20, [seg('say', 2), seg('demo', 8, { notes: notes3, bpm: 60 }), seg('praise', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    let events = eng.tick(1);
    expect(eng.segIndex).toBe(0);
    events = eng.tick(1.05);
    expect(eng.segIndex).toBe(1);
    expect(events.some((e) => e.type === 'noteOn' && e.p === 'E4')).toBe(true);
    events = eng.tick(1);
    expect(events.filter((e) => e.type === 'noteOn').map((e) => (e as { p: string }).p)).toEqual(['D4']);
    eng.tick(10);
    expect(eng.segIndex).toBe(2);
    expect(eng.classTime).toBeCloseTo(13.05);
  });

  it('reports finished at the end of the last segment', () => {
    const cls = makeClass('hcb', 2, 10, [seg('say', 4), seg('praise', 6)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    const events = eng.tick(10.5);
    expect(eng.finished).toBe(true);
    expect(events.some((e) => e.type === 'finished')).toBe(true);
  });
});

describe('your_turn waiting', () => {
  const cls = makeClass('hcb', 3, 30, [seg('say', 2), seg('your_turn', 20, { notes: notes3, bpm: 60 }), seg('praise', 8)]);

  function atYourTurn() {
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(2.01);
    return eng;
  }

  it('lights the first note and waits for it (time does not advance)', () => {
    const eng = atYourTurn();
    expect(eng.segment.kind).toBe('your_turn');
    expect(eng.waitingFor).toBe('E4');
    const t = eng.classTime;
    eng.tick(30);
    expect(eng.waitingFor).toBe('E4');
    expect(eng.classTime).toBe(t);
    expect(eng.segIndex).toBe(1);
  });

  it('a wrong key plays its sound and hints the right key, never fails', () => {
    const eng = atYourTurn();
    const events = eng.press('G4');
    expect(events).toEqual([
      { type: 'sound', p: 'G4' },
      { type: 'hint', p: 'E4' },
    ]);
    expect(eng.waitingFor).toBe('E4');
    expect(eng.stats.yourTurnWrong).toBe(1);
  });

  it('the right key advances to the next note', () => {
    const eng = atYourTurn();
    const events = eng.press('E4');
    expect(events[0]).toEqual({ type: 'sound', p: 'E4' });
    expect(events[1]).toEqual({ type: 'hit', p: 'E4' });
    eng.tick(5);
    expect(eng.waitingFor).toBe('D4');
  });

  it('finishes the segment shortly after the last note, then continues', () => {
    const eng = atYourTurn();
    for (const p of ['E4', 'D4', 'C4']) {
      eng.tick(5);
      expect(eng.waitingFor).toBe(p);
      eng.press(p);
    }
    expect(eng.waitingFor).toBeNull();
    // last note C4 starts at 3 s and lasts 2 s; the segment ends 1.5 s after it
    eng.tick(3.4);
    expect(eng.segIndex).toBe(1);
    eng.tick(0.2);
    expect(eng.segIndex).toBe(2);
    expect(eng.stats.yourTurnDone).toBe(1);
    expect(eng.allYourTurnDone).toBe(true);
  });

  it('accepts an early correct tap for the upcoming note', () => {
    const eng = atYourTurn();
    eng.press('E4');
    // D4 is not lit yet but a quick child presses it
    const events = eng.press('D4');
    expect(events.some((e) => e.type === 'hit' && e.p === 'D4')).toBe(true);
  });

  it('perfect when no wrong keys during your_turn', () => {
    const eng = atYourTurn();
    for (const p of ['E4', 'D4', 'C4']) {
      eng.tick(5);
      eng.press(p);
    }
    eng.tick(20);
    expect(eng.finished).toBe(true);
    expect(eng.result()).toMatchObject({ completed: true, perfect: true });
  });
});

describe('lesson-file timing model (leadInSec, gapBeats, parent notes)', () => {
  const child = (p: string, d = 1) => ({ p, d });
  const parent = (p: string, d = 1) => ({ p, d, who: 'parent' as const });

  it('starts notes after the count-in and adds gapBeats before each child note', () => {
    const s = seg('your_turn', 20, { bpm: 60, leadInSec: 2, gapBeats: 1, notes: [child('C4'), parent('D4'), child('E4')] });
    const sched = noteSchedule(s, 80);
    expect(sched.map((n) => n.startSec)).toEqual([3, 4, 6]);
    expect(sched.map((n) => n.who)).toEqual(['child', 'parent', 'child']);
  });

  it('your_turn plays parent notes by itself and waits only for the child notes', () => {
    const cls = makeClass('m', 5, 30, [seg('your_turn', 20, { bpm: 60, leadInSec: 1, gapBeats: 1, notes: [child('E4'), parent('D4'), parent('C4'), child('E4')] }), seg('praise', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(1.5);
    expect(eng.waitingFor).toBeNull();
    eng.tick(1);
    expect(eng.waitingFor).toBe('E4');
    eng.press('E4');
    const ev = eng.tick(2.2);
    expect(ev.filter((e) => e.type === 'noteOn').map((e) => (e as { p: string }).p)).toEqual(['D4', 'C4']);
    eng.tick(5);
    expect(eng.waitingFor).toBe('E4');
  });

  it('does not accept an early tap when a parent note comes first', () => {
    const cls = makeClass('m', 5, 30, [seg('your_turn', 20, { bpm: 60, notes: [child('E4'), parent('D4'), child('C4')] }), seg('praise', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(0.01);
    eng.press('E4');
    const ev = eng.press('C4');
    expect(ev.some((e) => e.type === 'hit')).toBe(false);
  });

  it('counts only child notes as your_turn hits', () => {
    const cls = makeClass('m', 5, 30, [seg('your_turn', 20, { bpm: 60, notes: [parent('D4'), child('E4')] }), seg('praise', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(1.5);
    expect(eng.waitingFor).toBe('E4');
    eng.press('E4');
    expect(eng.stats.yourTurnHits).toBe(1);
  });

  it('say segments light their showKeys', () => {
    const cls = makeClass('m', 2, 10, [seg('say', 10, { showKeys: ['C4', 'E4'] })]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(1);
    expect(eng.litKeys()).toEqual(['C4', 'E4']);
  });

  it('together with only parent notes accepts any tap as playing along', () => {
    const cls = makeClass('m', 2, 10, [seg('together', 10, { bpm: 60, notes: [parent('C4'), parent('D4')] })]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(0.5);
    expect(eng.press('A4')).toEqual([{ type: 'sound', p: 'A4' }, { type: 'beatTap' }]);
  });
});

describe('watch mode (video fallback)', () => {
  it('plays child notes by itself instead of waiting, on the video timeline', () => {
    const cls = makeClass('m', 5, 30, [seg('your_turn', 20, { bpm: 60, leadInSec: 1, gapBeats: 1, notes: [{ p: 'E4', d: 1 }, { p: 'D4', d: 1 }] }), seg('praise', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80, watch: true });
    const ev = eng.tick(5);
    expect(eng.waitingFor).toBeNull();
    expect(ev.filter((e) => e.type === 'noteOn').map((e) => (e as { p: string }).p)).toEqual(['E4', 'D4']);
    eng.tick(30);
    expect(eng.finished).toBe(true);
  });
});

describe('beat and high_low', () => {
  it('beat accepts any key', () => {
    const cls = makeClass('t', 1, 20, [seg('beat', 20, { notes: notes3, bpm: 60 })]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(0.1);
    const ev = eng.press('A4');
    expect(ev).toEqual([{ type: 'sound', p: 'A4' }, { type: 'beatTap' }]);
    expect(eng.stats.alongTaps).toBe(1);
  });

  it('high_low accepts the correct half and hints otherwise', () => {
    const cls = makeClass('t', 1, 20, [seg('high_low', 20, { target: 'high' })]);
    const eng = new LessonEngine(cls, { songBpm: 80, splitMidi: 66 });
    eng.tick(0.1);
    expect(eng.press('C5')).toEqual([{ type: 'sound', p: 'C5' }, { type: 'sideOk', side: 'high' }]);
    expect(eng.press('C4')).toEqual([{ type: 'sound', p: 'C4' }, { type: 'sideHint', side: 'high' }]);
  });
});

describe('resume at segment level', () => {
  it('starts at the requested segment and reports class time from there', () => {
    const cls = makeClass('t', 1, 30, [seg('say', 5), seg('say', 10), seg('praise', 15)]);
    const eng = new LessonEngine(cls, { songBpm: 80, startSegIndex: 2 });
    expect(eng.segIndex).toBe(2);
    expect(eng.classTime).toBe(15);
  });

  it('counts skipped your_turn segments as done when resuming past them', () => {
    const cls = makeClass('t', 1, 30, [seg('your_turn', 10, { notes: notes3, bpm: 60 }), seg('say', 20)]);
    const eng = new LessonEngine(cls, { songBpm: 80, startSegIndex: 1 });
    expect(eng.allYourTurnDone).toBe(true);
  });

  it('a listen-only class (nothing to press) earns 3 stars for staying to the end', () => {
    const cls = makeClass('t', 1, 20, [seg('listen', 20, { notes: notes3, bpm: 60 })]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    eng.tick(19);
    expect(eng.result().stars).toBe(1);
    eng.tick(2);
    expect(eng.result().stars).toBe(3);
  });

  it('a class with no your_turn completes at the end', () => {
    const cls = makeClass('t', 1, 10, [seg('say', 10)]);
    const eng = new LessonEngine(cls, { songBpm: 80 });
    expect(eng.result().completed).toBe(false);
    eng.tick(11);
    expect(eng.result().completed).toBe(true);
  });
});
