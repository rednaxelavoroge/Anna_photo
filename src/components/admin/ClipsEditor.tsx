"use client";

import { Arrows, BTN_TEXT, Thumb, VideoUploader, move } from "@/components/admin/ui";
import type { VideoClip } from "@/lib/content";

/** Ролики, лежащие на сайте, с подписями: мастер-классы, сюжеты ТВ. */
export function ClipsEditor({
  clips,
  onChange,
  onStage,
  disabled,
  hint,
}: {
  clips: VideoClip[];
  onChange: (clips: VideoClip[], removedSrc?: string) => void;
  onStage?: (busy: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      <ul className="mt-2 space-y-2">
        {clips.map((clip, index) => (
          <li key={`${clip.src}-${index}`} className="flex flex-wrap items-center gap-3 border border-line bg-paper px-3 py-2">
            <Thumb src={clip.src} className="h-14 w-24 shrink-0" />
            <input
              className="min-w-[200px] flex-1 border border-line bg-surface px-2 py-1 text-sm"
              value={clip.title}
              placeholder="Подпись под роликом"
              onChange={(event) => onChange(clips.map((row, i) => (i === index ? { ...row, title: event.target.value } : row)))}
            />
            <Arrows disabled={disabled} onUp={() => onChange(move(clips, index, -1))} onDown={() => onChange(move(clips, index, 1))} />
            <button
              type="button"
              className={`${BTN_TEXT} text-muted`}
              disabled={disabled}
              onClick={() => {
                if (!confirm("Убрать ролик с сайта?")) return;
                onChange(clips.filter((_, i) => i !== index), clip.src);
              }}
            >
              Убрать
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <VideoUploader
          label="Добавить ролик с телефона"
          onDone={(src) => onChange([...clips, { src, title: "" }])}
          onStage={(stage) => onStage?.(stage === "sending" || stage === "working")}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
