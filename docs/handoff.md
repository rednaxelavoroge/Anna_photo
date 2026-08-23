# Anna_photo — handoff

Photography site for Anna Manasaryan, domain **annamanasaryan.com**.
Stack: Next.js 15 App Router, Tailwind 4, Framer Motion, Lenis. Production: **Vercel**.
Photos will live in `public/photos/{category}/{album-slug}` (same idea as the .art repo). Until Anna sends a shortlist, grey CoverArt plates stay as rhythm placeholders — they are not her final frames.

Do not bulk-import the old WordPress site or `wp-content`. Do not scrape https://www.annamanasaryan.com into this repo to fake a finished portfolio. She curates (too many photos; she may use ChatGPT to reduce); we drop only those files into the matching album folders. Optional later: one cover per category if she sends them. We do not pull those ourselves.

Do not deploy this into the Namecheap folder of `.art` or the old WordPress `public_html`.
Old WP stays put until DNS cuts over.

## Motion

- `SplitReveal` — name halves part on **scroll**.
- `MeetSection` — sticky `200svh`, halves come from left/right, meet, hold, part.
- Bound to scroll, works on mobile. `prefers-reduced-motion` skips transforms.

## Content still needed from Anna

- Shortlist of photos per album (not the whole old archive)
- Optional: one cover image per category for a richer demo
- Real workshop titles if the 45 stubs are wrong
- Real reviews
- Confirm Instagram handle for photography (now `annamanasaryan`)
