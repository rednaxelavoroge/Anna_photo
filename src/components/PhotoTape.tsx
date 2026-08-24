"use client";

import { CoverArt } from "@/components/CoverArt";
import { Lightbox } from "@/components/Lightbox";
import type { Photo } from "@/lib/content";
import { useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

/** Core theme `imf.create(..., horizon, size, zoom, border)` */
const HORIZON = 0.52;
const SIZE = 0.38;
const BORDER = 14;
const LERP = 0.12;
const DRAG_THRESHOLD = 8;
const AUTO_MS = 3600;

type Slot = {
  loaded: boolean;
  r: number;
  iw: number;
  x0: number;
  x1: number;
  w0: number;
  w1: number;
  z2: number;
};

function isVideo(photo: Photo) {
  return photo.kind === "video" || Boolean(photo.src && /\.(mp4|webm|mov)$/i.test(photo.src));
}

function emptySlot(stageW: number): Slot {
  return { loaded: false, r: 1, iw: 0, x0: stageW, x1: stageW, w0: 0, w1: 0, z2: 0 };
}

function CoverMedia({
  photo,
  slug,
  className,
  onSize,
}: {
  photo: Photo;
  slug: string;
  className: string;
  onSize?: (width: number, height: number) => void;
}) {
  useLayoutEffect(() => {
    onSize?.(photo.width, photo.height);
  }, [onSize, photo.height, photo.width]);

  return <CoverArt slug={`${slug}-${photo.id}`} title={photo.alt} className={className} />;
}

function Media({
  photo,
  slug,
  className,
  onSize,
}: {
  photo: Photo;
  slug: string;
  className: string;
  onSize?: (width: number, height: number) => void;
}) {
  if (isVideo(photo) && photo.src) {
    return (
      <video
        className={className}
        src={photo.src}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        draggable={false}
        ref={(node) => {
          if (node && node.videoWidth && node.videoHeight) onSize?.(node.videoWidth, node.videoHeight);
        }}
        onLoadedMetadata={(event) => {
          const node = event.currentTarget;
          if (node.videoWidth && node.videoHeight) onSize?.(node.videoWidth, node.videoHeight);
        }}
      />
    );
  }
  if (photo.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.src}
        alt=""
        className={className}
        draggable={false}
        ref={(node) => {
          if (node?.complete && node.naturalWidth && node.naturalHeight) {
            onSize?.(node.naturalWidth, node.naturalHeight);
          }
        }}
        onLoad={(event) => {
          const node = event.currentTarget;
          if (node.naturalWidth && node.naturalHeight) onSize?.(node.naturalWidth, node.naturalHeight);
        }}
      />
    );
  }
  return <CoverMedia photo={photo} slug={slug} className={className} onSize={onSize} />;
}

export function PhotoTape({ photos, slug }: { photos: Photo[]; slug: string }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const slotsRef = useRef<Slot[]>([]);
  const viewRef = useRef(0);
  const draggingRef = useRef(false);
  const pendingRef = useRef(false);
  const movedRef = useRef(false);
  const hoverRef = useRef(false);
  const openRef = useRef(open);
  const calcRef = useRef<() => void>(() => {});
  const stepRef = useRef<(dir: number) => void>(() => {});
  const autoDir = useRef(1);
  const idleRef = useRef(0);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const wheelLock = useRef(0);
  const wheelAcc = useRef(0);
  const n = photos.length;
  openRef.current = open;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || n === 0) return;

    const stageW = () => stage.clientWidth || 1;
    const stageH = () => stage.clientHeight || 1;
    slotsRef.current = photos.map(() => emptySlot(stageW()));
    viewRef.current = 0;

    const calc = () => {
      const slots = slotsRef.current;
      const view = Math.max(0, Math.min(n - 1, viewRef.current));
      viewRef.current = view;
      const o = slots[view];
      const wh = stageW();
      const ht = stageH();
      if (!o?.loaded) {
        const first = slots.findIndex((slot) => slot.loaded);
        if (first < 0) return;
        viewRef.current = first;
        return calc();
      }

      const maxCenterRatio = wh < 768 ? 0.88 : 0.82;
      if (o.r < 1) o.w1 = Math.min(o.iw || wh, wh * maxCenterRatio, Math.round((ht * HORIZON) / o.r));
      else o.w1 = Math.min(wh * maxCenterRatio, Math.round((ht * HORIZON) / o.r));

      const x0 = (o.x1 = wh * 0.5 - o.w1 * 0.5);
      let x = x0 + o.w1 + BORDER;
      for (let i = view + 1; i < n; i += 1) {
        const slot = slots[i];
        if (!slot.loaded) continue;
        slot.x1 = x;
        slot.w1 = (ht / slot.r) * SIZE;
        x += slot.w1 + BORDER;
      }
      x = x0 - BORDER;
      for (let i = view - 1; i >= 0; i -= 1) {
        const slot = slots[i];
        if (!slot.loaded) continue;
        slot.w1 = (ht / slot.r) * SIZE;
        slot.x1 = x - slot.w1;
        x -= slot.w1 + BORDER;
      }

      if (thumbRef.current && n > 1) {
        thumbRef.current.style.left = `${(view / (n - 1)) * 100}%`;
      }
    };

    const applySize = (index: number, width: number, height: number) => {
      if (!width || !height) return;
      const slot = slotsRef.current[index] ?? emptySlot(stageW());
      slot.iw = width;
      slot.r = height / width;
      slot.loaded = true;
      slotsRef.current[index] = slot;
    };

    const hydrate = () => {
      itemsRef.current.forEach((node, index) => {
        if (!node) return;
        const media = node.querySelector("img, video");
        if (media instanceof HTMLImageElement && media.naturalWidth && media.naturalHeight) {
          applySize(index, media.naturalWidth, media.naturalHeight);
        } else if (media instanceof HTMLVideoElement && media.videoWidth && media.videoHeight) {
          applySize(index, media.videoWidth, media.videoHeight);
        }
      });
      calc();
    };

    const paint = (force = false) => {
      const slots = slotsRef.current;
      const ht = stageH();
      const wh = stageW();
      const view = viewRef.current;
      slots.forEach((slot, index) => {
        const node = itemsRef.current[index];
        if (!node || !slot.loaded) return;
        const sx = slot.x1 - slot.x0;
        const sw = slot.w1 - slot.w0;
        if (Math.abs(sx) > 2 || Math.abs(sw) > 2 || force) {
          slot.x0 += sx * (reduced ? 1 : LERP);
          slot.w0 += sw * (reduced ? 1 : LERP);
        }
        const h = slot.w0 * slot.r;
        slot.z2 = 0;
        if (slot.x0 < wh && slot.x0 + slot.w0 > 0 && slot.w0 > 1) {
          node.style.display = "block";
          node.style.left = `${Math.round(slot.x0)}px`;
          node.style.bottom = `${Math.floor(ht * (1 - HORIZON))}px`;
          node.style.width = `${Math.round(slot.w0)}px`;
          node.style.height = `${Math.floor(h)}px`;
          node.style.zIndex = String(n - Math.abs(index - view));
          node.classList.toggle("is-current", index === view);
        } else {
          node.style.display = "none";
        }
      });
    };

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!reduced && openRef.current === null && !hoverRef.current && !draggingRef.current && n > 1) {
        idleRef.current += dt;
        if (idleRef.current >= AUTO_MS) {
          idleRef.current = 0;
          let next = viewRef.current + autoDir.current;
          if (next >= n || next < 0) {
            autoDir.current *= -1;
            next = viewRef.current + autoDir.current;
          }
          viewRef.current = next;
          calc();
        }
      }
      paint();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const step = (dir: number) => {
      const next = viewRef.current + dir;
      if (next < 0 || next >= n) return;
      viewRef.current = next;
      idleRef.current = 0;
      calc();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const now = performance.now();
      const rawDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(rawDelta) < 0.2) return;

      // Mouse wheel with line steps or big discrete jumps
      if (event.deltaMode !== 0 || Math.abs(rawDelta) >= 40) {
        if (now - wheelLock.current < 160) return;
        wheelLock.current = now;
        wheelAcc.current = 0;
        step(rawDelta > 0 ? 1 : -1);
        return;
      }

      // Smooth trackpad / continuous wheel
      wheelAcc.current += rawDelta;
      const THRESHOLD = 30;
      if (Math.abs(wheelAcc.current) >= THRESHOLD) {
        if (now - wheelLock.current < 90) return;
        wheelLock.current = now;
        step(wheelAcc.current > 0 ? 1 : -1);
        wheelAcc.current = 0;
      }
    };

    calcRef.current = calc;
    stepRef.current = step;

    const onKey = (event: KeyboardEvent) => {
      if (openRef.current !== null) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };

    const resize = new ResizeObserver(() => {
      calc();
      paint(true);
    });
    resize.observe(stage);
    window.addEventListener("keydown", onKey);
    stage.addEventListener("wheel", onWheel, { passive: false });
    const onMedia = () => hydrate();
    stage.querySelectorAll("img, video").forEach((media) => {
      media.addEventListener("load", onMedia);
      media.addEventListener("loadedmetadata", onMedia);
    });
    hydrate();
    paint(true);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("keydown", onKey);
      stage.removeEventListener("wheel", onWheel);
      stage.querySelectorAll("img, video").forEach((media) => {
        media.removeEventListener("load", onMedia);
        media.removeEventListener("loadedmetadata", onMedia);
      });
    };
  }, [n, photos, reduced]);

  const setSize = (index: number, width: number, height: number) => {
    const stage = stageRef.current;
    if (!stage || !width || !height) return;
    const slot = slotsRef.current[index] ?? emptySlot(stage.clientWidth);
    slot.iw = width;
    slot.r = height / width;
    slot.loaded = true;
    slotsRef.current[index] = slot;
    calcRef.current();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current && movedRef.current) {
      const dx = event.clientX - dragStartX.current;
      const dt = performance.now() - dragStartTime.current;
      const velocity = Math.abs(dx) / Math.max(1, dt);
      if (Math.abs(dx) > 25 || velocity > 0.35) {
        stepRef.current(dx < 0 ? 1 : -1);
      }
    }
    pendingRef.current = false;
    draggingRef.current = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onOpen = (index: number) => {
    if (movedRef.current) return;
    if (viewRef.current === index) {
      setOpen(index);
      return;
    }
    viewRef.current = index;
    idleRef.current = 0;
    calcRef.current();
  };

  return (
    <div className="image-flow-stage">
      <div
        ref={stageRef}
        className="image-flow"
        data-lenis-prevent
        onPointerEnter={() => {
          hoverRef.current = true;
        }}
        onPointerLeave={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && event.currentTarget.contains(next)) return;
          hoverRef.current = false;
          pendingRef.current = false;
          draggingRef.current = false;
        }}
        onPointerDown={(event) => {
          pendingRef.current = true;
          draggingRef.current = false;
          movedRef.current = false;
          dragStartX.current = event.clientX;
          dragStartTime.current = performance.now();
        }}
        onPointerMove={(event) => {
          if (!pendingRef.current && !draggingRef.current) return;
          const dx = event.clientX - dragStartX.current;
          if (!draggingRef.current && Math.abs(dx) >= DRAG_THRESHOLD) {
            draggingRef.current = true;
            movedRef.current = true;
            event.currentTarget.classList.add("is-dragging");
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* ignore */
            }
          }
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="image-flow-horizon" aria-hidden="true" />
        {photos.map((photo, index) => (
          <button
            key={`${photo.id}-${index}`}
            ref={(node) => {
              itemsRef.current[index] = node;
            }}
            type="button"
            className="image-flow-item"
            aria-label={photo.alt}
            onClick={() => onOpen(index)}
          >
            <span className="image-flow-plate">
              <Media photo={photo} slug={slug} className="image-flow-image" onSize={(w, h) => setSize(index, w, h)} />
            </span>
            <span className="image-flow-reflection" aria-hidden="true">
              <span className="image-flow-reflection-inner">
                <Media photo={photo} slug={slug} className="image-flow-image" />
              </span>
            </span>
          </button>
        ))}
        <div className="image-flow-scrollbar" aria-hidden="true">
          <div ref={thumbRef} className="image-flow-thumb" />
        </div>

        {open !== null ? (
          <Lightbox
            photos={photos}
            index={open}
            slug={slug}
            onClose={() => setOpen(null)}
            onPrev={() => setOpen((current) => (current === null ? 0 : (current + photos.length - 1) % photos.length))}
            onNext={() => setOpen((current) => (current === null ? 0 : (current + 1) % photos.length))}
          />
        ) : null}
      </div>
    </div>
  );
}
