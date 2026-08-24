# Photos

`_preview/` holds a small temporary set of album thumbs from the live site for the design demo. Grey CoverArt plates appear only when no preview exists. Put Anna’s selected web-size files in the folders below before launch. Do not import the old WordPress archive. Do not dump the 5000-frame Lightroom library.

```
public/photos/{category}/01.jpg
public/photos/backstage/01.jpg
public/photos/library/01.jpg   # optional shared pool, tagged in src/data/photo-tags.json
```

Portfolio is a **flat** list: one folder per category, no nested albums. The same file can appear in several sections via `src/data/photo-tags.json` (`src` + `categories`).

Category slugs: `newborn`, `babies`, `children`, `family`, `individual`, `armenian-costumes`, `animals`, `underwater`, `smoke-paint`, `new-year`, `bloom`, `autumn`, `interiors`, `watches`, `food`, `product`, `reportage`, `video`, `travel`, `ai`.

Accepted: `.jpg` `.jpeg` `.png` `.webp` `.avif`.
