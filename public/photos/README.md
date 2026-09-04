# Photos

`_preview/` holds a small temporary set of album thumbs from the live site for the design demo. Grey CoverArt plates appear only when no preview exists. Put Anna’s selected web-size files in the folders below before launch. Do not import the old WordPress archive. Do not dump the 5000-frame Lightroom library.

```
public/photos/{category}/01.jpg
public/photos/backstage/01.jpg
public/photos/library/01.jpg   # optional shared pool, tagged in src/data/photo-tags.json
```

Portfolio is a **flat** list: one folder per category, no nested albums. The same file can appear in several sections via `src/data/photo-tags.json` (`src` + `categories`).

Category slugs: `newborn`, `babies`, `children`, `family`, `individual`, `armenian-costumes`, `animals`, `underwater`, `smoke-paint`, `new-year`, `bloom` (folder `blooming`), `autumn`, `interiors`, `watches`, `food`, `product` (folder `objects`), `reportage`, `travel`, `ai`.

Service folders, not portfolio: `press/` (about page: TV, exhibitions, magazine pages; `press/publications/<id>/` — frames from the press articles), `reviews/` (screenshots of reviews), `workshops/` (training page), `backstage/`, `uploads/` (videos compressed by the panel). Videos of the site itself live in `public/videos/`.

File names: Latin letters only. FTP and Apache on the hosting are not tested with Cyrillic names, so every video and photo is renamed before it gets here.

Weight: photos are re-encoded to at most 2000 px on the long side, JPEG quality 85, progressive; videos to 1280 px on the long side, H.264 CRF 23, `+faststart`. Source files stay in Anna's Yandex.Disk archive.

Accepted: `.jpg` `.jpeg` `.png` `.webp` `.avif`.
