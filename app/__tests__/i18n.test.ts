import { t, tList, makeT, gateQuestion, numberWord } from '@/i18n';

describe('strings', () => {
  it('reads copy keys and fills placeholders', () => {
    expect(t('common.appName')).toBe('Little Duet');
    expect(t('home.continueClassOf', { index: 3, total: 8 })).toBe('Class 3 of 8');
  });

  it('picks _one / _other plurals from count', () => {
    expect(t('common.classes', { count: 1 })).toBe('1 class');
    expect(t('common.classes', { count: 8 })).toBe('8 classes');
  });

  it('falls back to the app overlay for keys the copy file does not have', () => {
    expect(t('home.pickedFor', { name: 'Maya', age: 3 })).toBe('Picked for Maya (age 3)');
  });

  it('copy wins over the overlay when both define a key', () => {
    const tt = makeT({ a: { b: 'copy' } }, { a: { b: 'overlay', c: 'only overlay' } });
    expect(tt('a.b')).toBe('copy');
    expect(tt('a.c')).toBe('only overlay');
  });

  it('returns the key itself when missing so gaps are visible, never crashes', () => {
    expect(t('nope.missing')).toBe('nope.missing');
  });

  it('reads string lists', () => {
    expect(tList('paywall.features', { name: 'Maya' }).length).toBeGreaterThan(2);
    expect(tList('paywall.features', { name: 'Maya' }).join(' ')).toContain('Maya');
  });
});

describe('parental gate question', () => {
  it('writes numbers as words', () => {
    expect(numberWord(7)).toBe('seven');
    expect(numberWord(15)).toBe('fifteen');
  });

  it('builds a plus question with a sum from 10 to 20 and the digit answer', () => {
    const q = gateQuestion(() => 0); // first template, lowest numbers
    expect(q.text).toMatch(/^What is [a-z]+ plus [a-z]+\?$/);
    expect(Number(q.answer)).toBeGreaterThanOrEqual(10);
    expect(Number(q.answer)).toBeLessThanOrEqual(20);
  });

  it('times questions have products up to 50', () => {
    const seq = [0.4, 0.99, 0.99];
    let i = 0;
    const q = gateQuestion(() => seq[i++ % seq.length]);
    expect(q.text).toMatch(/times/);
    expect(Number(q.answer)).toBeLessThanOrEqual(50);
  });
});
