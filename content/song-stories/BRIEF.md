# Song stories: research brief (Little Duet)

You are a music historian and children's-book editor. For each song in your input batch, research
the facts on the web, then write a short, accurate "About this song" entry for a kids' piano app
(children aged 2-6, read aloud by a parent).

## Facts first
- Use WebSearch/WebFetch. Prefer strong sources: Library of Congress, Smithsonian, Roud Folk Song
  Index / VWML, Oxford Dictionary of Nursery Rhymes (via quotes), Britannica, IMSLP, university or
  museum pages, Snopes for myths. Wikipedia is fine for leads; confirm key facts elsewhere when you can.
- Never invent an author, date or reason. If the author is unknown, write "Traditional" plus the
  tradition, e.g. "Traditional English nursery rhyme". If a date is uncertain, use "c. 1765" or
  "18th century".
- Many famous "origin stories" are myths (for example, "Ring a Ring o' Roses is about the plague").
  Do not repeat them as fact. If a myth is well known, record it in `myth` together with what is
  actually known.
- Stay consistent with the catalog's `origin` and `publicDomainBasis` fields; if your research
  contradicts them, explain in `catalogNote`.

## Writing rules
- `aboutKids`: what the song is about, for a 3-year-old, warm and concrete, max 25 words.
- `story`: for grown-ups: who wrote it, when, why or how it spread, max 60 words.
- `funFact`: one surprising, verified fact a family would enjoy, max 25 words.
- Kid-safe and gentle: no gore or scary detail (Three Blind Mice, Rock-a-bye Baby), no politics.
  Describe religious songs neutrally ("a Christmas carol sung for over 200 years").
- No quoted lyrics beyond the title. No emoji. English only.

## Output
Write `content/song-stories/batch-<N>.json` as a JSON array, one object per input song, in input order:

```json
{
  "id": "twinkle-twinkle",
  "writtenBy": "Words: Jane Taylor. Tune: French folk melody",
  "year": "1806 (words); 1761 (tune)",
  "origin": "England and France",
  "aboutKids": "A child looks up at a tiny, sparkly star in the night sky and wonders what it is.",
  "story": "...",
  "funFact": "The same tune is used for the Alphabet Song and Baa Baa Black Sheep.",
  "myth": null,
  "catalogNote": null,
  "confidence": "high",
  "sources": ["https://...", "https://..."]
}
```

`confidence`: high (two solid sources agree), medium (one solid source), low (unclear; say why in
`catalogNote`). At least one source per song. Before finishing, validate with:
`python3 -c "import json;d=json.load(open('content/song-stories/batch-<N>.json'));print(len(d))"`
and check that every `id` in your input appears exactly once.
