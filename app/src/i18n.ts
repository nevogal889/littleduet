import copy from './data/strings.en.json';
import overlay from './data/strings.app.json';

// String source: copy/strings.en.json (copied by scripts/sync-content.mjs). Keys the copy
// does not have yet come from strings.app.json. Copy always wins.
type Dict = { [k: string]: unknown };
type Params = Record<string, string | number | undefined>;

function get(d: Dict, key: string): unknown {
  return key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Dict)[k] : undefined), d);
}

function fill(s: string, p?: Params): string {
  if (!p) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (p[k] === undefined ? m : String(p[k])));
}

export function makeT(primary: Dict, fallback: Dict) {
  const lookup = (key: string): unknown => get(primary, key) ?? get(fallback, key);
  const t = (key: string, p?: Params): string => {
    if (p && typeof p.count === 'number') {
      const plural = lookup(`${key}_${p.count === 1 ? 'one' : 'other'}`);
      if (typeof plural === 'string') return fill(plural, p);
    }
    const v = lookup(key);
    return typeof v === 'string' ? fill(v, p) : key;
  };
  const tList = (key: string, p?: Params): string[] => {
    const v = lookup(key);
    return Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? fill(x, p) : x)) : [];
  };
  return Object.assign(t, { list: tList, raw: lookup });
}

const T = makeT(copy as Dict, overlay as Dict);
export const t = T;
export const tList = T.list;
export const tRaw = T.raw;

/** Pick a stable item from a string list (e.g. praise lines) by seed. */
export function tPick(key: string, seed: number, p?: Params): string {
  const l = tList(key, p);
  return l.length ? l[Math.abs(Math.floor(seed)) % l.length] : '';
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/**
 * Parental gate question from gate.questions: numbers spelled out (needs adult reading),
 * sums 10-20, products up to 50. The answer is typed as digits.
 */
export function gateQuestion(rand: () => number = Math.random): { text: string; answer: string } {
  const templates = tList('gate.questions');
  const pick = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1) * 0.9999);
  const which = Math.floor(rand() * 3 * 0.9999);
  const tpl = templates[which] ?? ['What is {a} plus {b}?', 'What is {a} times {b}?', 'Type these numbers in order: {a}, {b}, {c}'][which];
  if (which === 1) {
    const a = pick(2, 5);
    const b = pick(2, 10);
    return { text: fill(tpl, { a: numberWord(a), b: numberWord(b) }), answer: String(a * b) };
  }
  if (which === 2) {
    const a = pick(1, 9);
    const b = pick(1, 9);
    const c = pick(1, 9);
    return { text: fill(tpl, { a: numberWord(a), b: numberWord(b), c: numberWord(c) }), answer: `${a}${b}${c}` };
  }
  const sum = pick(10, 20);
  const a = pick(Math.max(1, sum - 12), Math.min(12, sum - 1));
  return { text: fill(tpl, { a: numberWord(a), b: numberWord(sum - a) }), answer: String(sum) };
}

export function checkGateAnswer(q: { answer: string }, input: string): boolean {
  return input.trim() !== '' && input.trim() === q.answer;
}
