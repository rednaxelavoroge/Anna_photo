# Anna_photo — handoff

Photography site for Anna Manasaryan, domain **annamanasaryan.com**.
Stack: Next.js 15 App Router, Tailwind 4, Framer Motion, Lenis. Production: **Vercel**.
Photos will live in `public/photos` (same idea as the .art repo).

Do not deploy this into the Namecheap folder of `.art` or the old WordPress `public_html`.
Old WP stays put until DNS cuts over.

## Motion

- `SplitReveal` — name halves part on **scroll**.
- `MeetSection` — sticky `200svh`, halves come from left/right, meet, hold, part.
- Bound to scroll, works on mobile. `prefers-reduced-motion` skips transforms.

## Content still needed from Anna

- Selected photos per album
- Real workshop titles if the 45 stubs are wrong
- Real reviews
- Confirm Instagram handle for photography (now `annamanasaryan`)
