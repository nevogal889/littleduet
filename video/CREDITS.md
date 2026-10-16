# Credits and licences

## Piano samples
**Salamander Grand Piano V3** by Alexander Holm (Yamaha C5), licensed
[CC-BY 3.0](http://creativecommons.org/licenses/by/3.0/).
Taken as mp3s from the Tone.js audio repository (github.com/Tonejs/audio, `salamander/`),
sparse-cloned into `video/assets/tonejs-audio/` (its `salamander/README` holds the original licence text).
We pitch-shift the minor-third samples to every semitone C3..C6 and trim them; these
derived sounds are used in every lesson video and in `video/samples/*.mp3`.

Required attribution (store listing / app "About" screen):
> Piano sound: Salamander Grand Piano by Alexander Holm, CC-BY 3.0.

## Fonts
- **Bricolage Grotesque** (captions, lyrics, numbers) by Mathieu Triay, SIL Open Font License 1.1 —
  `video/assets/gfonts/ofl/bricolagegrotesque/OFL.txt`
- **DM Sans** (grown-up cue line, labels) by Colophon Foundry / Google, SIL Open Font License 1.1 —
  `video/assets/gfonts/ofl/dmsans/OFL.txt`

Both come from github.com/google/fonts (sparse checkout of `ofl/bricolagegrotesque` and `ofl/dmsans`).
Fallback if missing: DejaVu Sans (system font).

## Graphics
All icons, the keyboard and the animations are drawn in code (`video/ld_icons.py`, `video/render.py`).
No third-party images.
