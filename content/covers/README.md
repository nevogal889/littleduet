# Real song photos

Drop one photo per song here, named exactly `<songId>.jpg` (see content/cover-photos.csv for the ids and suggested searches).

- Source: Unsplash or Pexels (free for commercial use, no attribution required; keep the photo URL in the CSV for your records). Avoid photos with recognisable people's faces or brand logos.
- Size: landscape, at least 1600 x 900 px; the app crops to 16:9 and to a square, so keep the subject centred.
- Run `node app/scripts/sync-content.mjs` (or just push to GitHub): the app uses `content/covers/<songId>.jpg` when present and falls back to the lesson-style cover otherwise.

## Current set
All 100 photos come from Pixabay (Pixabay Content License: free for commercial use, no attribution required).
`credits.csv` records each photo's page, photographer and Pixabay id. Photos were chosen to avoid people's faces,
logos and text. Replace any file with the same name to swap a photo.
