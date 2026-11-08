import { addLog, noteStats, noticed, outcomeFor, planFor, weekReport, type ClassLog, type CueOutcome } from '@/lib/coach';

const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 8, 12);
let n = 0;
function log(song: string, cues: [string, CueOutcome][], daysAgo = 0, sec = 240): ClassLog {
  n++;
  return { classId: `${song}-c0${n % 9}`, songId: song, at: NOW - daysAgo * DAY - n * 1000, mode: 'real', sec, completed: true, cues: cues.map(([p, o]) => ({ p, o, w: o === 'solo' ? 2 : 9 })) };
}
const solo = (ps: string[]) => ps.map((p) => [p, 'solo'] as [string, CueOutcome]);
const helped = (ps: string[]) => ps.map((p) => [p, 'helped'] as [string, CueOutcome]);

describe('adaptive teacher', () => {
  it('scores a note found before the first nudge as solo, later as helped', () => {
    expect(outcomeFor(3)).toBe('solo');
    expect(outcomeFor(8)).toBe('helped');
    expect(outcomeFor(2, { hinted: true })).toBe('helped');
    expect(outcomeFor(2, { grownUp: true })).toBe('grownUp');
    expect(outcomeFor(2, { skipped: true })).toBe('skipped');
    expect(outcomeFor(4, { level: 'extra' })).toBe('helped'); // extra help nudges at 3 s
  });

  it('starts every child on normal help', () => {
    const p = planFor([], 'twinkle', ['C4', 'G4']);
    expect(p).toMatchObject({ hintLevel: 'normal', tempo: 1, reason: 'first' });
  });

  it('gives extra hints after two hard classes, and goes slower when this song was hard', () => {
    const logs = [log('mary', helped(['E4', 'D4', 'C4'])), log('twinkle', helped(['C4', 'G4', 'A4']))];
    expect(planFor(logs, 'ode', ['E4'])).toMatchObject({ hintLevel: 'extra', tempo: 1, reason: 'extra' });
    expect(planFor(logs, 'twinkle', ['C4'])).toMatchObject({ hintLevel: 'extra', tempo: 0.85, reason: 'slower' });
  });

  it('fades the hints when the child plays alone two classes running', () => {
    const logs = [log('mary', solo(['E4', 'D4', 'C4', 'D4'])), log('twinkle', solo(['C4', 'G4', 'A4', 'G4']))];
    expect(planFor(logs, 'ode', ['E4']).hintLevel).toBe('fade');
  });

  it('ignores classes where nothing was listened for (mic off)', () => {
    const logs = [log('mary', helped(['E4', 'D4', 'C4'])), log('twinkle', helped(['C4', 'G4'])), log('ode', [])];
    expect(planFor(logs, 'ode', ['E4']).hintLevel).toBe('extra');
  });

  it('can be switched off by the grown-up', () => {
    const logs = [log('mary', helped(['E4', 'D4', 'C4'])), log('twinkle', helped(['C4', 'G4', 'A4']))];
    expect(planFor(logs, 'twinkle', ['C4'], false)).toMatchObject({ hintLevel: 'normal', tempo: 1, focus: [] });
  });

  it('marks the notes this class should focus on, and the notes the child owns', () => {
    const logs = [log('a', [...solo(['C4', 'C4', 'G4']), ...helped(['E4', 'E4'])]), log('b', [...solo(['C4', 'G4', 'G4']), ['E4', 'grownUp']])];
    const p = planFor(logs, 'c', ['C4', 'E4', 'G4']);
    expect(p.focus).toEqual(['E']);
    expect(p.strong.includes('C') && p.strong.includes('G')).toBe(true);
    expect(noteStats(logs)[0].score).toBeGreaterThan(0.9);
  });

  it('notices first solo notes and what still needs help', () => {
    const before = [log('a', [...solo(['C4']), ...helped(['G4'])])];
    const now = log('a', [...solo(['C4', 'G4']), ...helped(['A4'])]);
    expect(noticed(now, before)).toEqual({ total: 3, solo: 2, firstSolo: ['G'], workingOn: ['A'], grownUpHelped: false });
  });

  it('reports the week against the week before', () => {
    const logs = [log('a', helped(['C4', 'D4']), 9), log('a', solo(['C4', 'D4']), 2), log('b', [...solo(['C4']), ['E4', 'helped']], 1, 300)];
    const w = weekReport(logs, NOW);
    expect(w.classes).toBe(2);
    expect(w.minutes).toBe(9);
    expect(w.soloShare).toBeCloseTo(0.75);
    expect(w.soloSharePrev).toBe(0);
  });

  it('keeps the last 80 logs', () => {
    let logs: ClassLog[] = [];
    for (let i = 0; i < 90; i++) logs = addLog(logs, log('a', solo(['C4'])));
    expect(logs).toHaveLength(80);
  });
});
