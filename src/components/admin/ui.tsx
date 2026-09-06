"use client";

import { mediaUrl } from "@/lib/media-url";
import { videoThumb } from "@/lib/thumbnail";
import { capturePoster, rememberPreview, usePreview } from "@/lib/upload-previews";
import { useVideoUpload, type VideoStage } from "@/lib/use-video-upload";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export const BTN = "rounded-full bg-ink px-5 py-2 text-xs tracking-[0.08em] text-snow uppercase disabled:opacity-40";
export const BTN_GHOST = "rounded-full border border-line bg-surface px-4 py-2 text-xs tracking-[0.08em] text-ink uppercase disabled:opacity-40";
export const BTN_TEXT = "text-xs tracking-[0.08em] uppercase disabled:opacity-40";
export const INPUT = "mt-1 w-full border border-line bg-surface px-3 py-2 text-sm";

export function isVideoFile(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-3 border border-line bg-surface p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l1.8 2h9A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z" />
    </svg>
  );
}

/**
 * Кнопка выбора файлов вместо голого браузерного поля: заказчица просила
 * «картинку типа папки». Само поле спрятано, нажимается кнопка-подпись.
 */
export function FilePick({
  label,
  accept,
  multiple,
  disabled,
  onFiles,
  ghost,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
  ghost?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex cursor-pointer items-center gap-2 ${ghost ? BTN_GHOST : BTN} ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <FolderIcon />
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={async (event) => {
          const input = event.currentTarget;
          // Файлы забираем ОТДЕЛЬНЫМ списком, и только потом чистим поле.
          //
          // Здесь и была поломка «фотография не добавляется, и ни слова в
          // ответ»: `input.value = ""` опустошает тот же самый FileList,
          // ссылку на который мы держали, — наружу уходил пустой список,
          // загрузка молча заканчивалась ничем, и «Сохранить кадр» потом
          // честно отвечала «добавьте хотя бы одну фотографию».
          //
          // Поле всё равно надо очистить, иначе повторный выбор того же
          // файла браузер не считает изменением. Делаем это после копии.
          const picked = input.files ? Array.from(input.files) : [];
          input.value = "";
          if (picked.length) await onFiles(picked);
        }}
      />
    </label>
  );
}

/** Полоса отправки с процентами. */
export function Progress({ percent }: { percent: number }) {
  return (
    <span className="mt-2 block h-1.5 w-full overflow-hidden bg-line">
      <span className="block h-full bg-ink transition-[width]" style={{ width: `${percent}%` }} />
    </span>
  );
}

/** Полоса «идёт работа» — движется, и рядом бегут секунды: видно, что панель не зависла. */
export function Working({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span className="mt-2 block">
      <span className="block h-1.5 w-full overflow-hidden bg-line">
        <span className="admin-indeterminate block h-full w-1/3 bg-ink" />
      </span>
      <span className="mt-1 block text-xs text-muted">
        {label} · {mm}:{ss}
      </span>
    </span>
  );
}

/**
 * Загрузка ролика с телефона: кнопка, проценты отправки, полоса сжатия.
 * Готовый путь отдаётся наружу; о состоянии сообщает, чтобы окно могло
 * погасить «Сохранить», пока ролик не готов.
 */
export function VideoUploader({
  label = "Выбрать ролик",
  onDone,
  onStage,
  disabled,
}: {
  label?: string;
  onDone: (src: string) => void;
  onStage?: (stage: VideoStage) => void;
  disabled?: boolean;
}) {
  const video = useVideoUpload();
  /** Кадр из выбранного ролика: видно, что именно заливается, пока идёт сжатие. */
  const [shot, setShot] = useState("");
  const shotRef = useRef("");

  useEffect(() => {
    onStage?.(video.stage);
  }, [video.stage, onStage]);

  // Адрес кадра живёт в браузере до тех пор, пока его показывают; уходя,
  // прибираем за собой, иначе картинка останется висеть в памяти вкладки.
  useEffect(() => {
    return () => {
      if (shotRef.current) URL.revokeObjectURL(shotRef.current);
    };
  }, []);

  const showShot = (url: string) => {
    if (shotRef.current) URL.revokeObjectURL(shotRef.current);
    shotRef.current = url;
    setShot(url);
  };

  const busy = video.stage === "sending" || video.stage === "working";
  return (
    <div>
      <FilePick
        label={label}
        accept="video/*"
        ghost
        disabled={disabled || busy}
        onFiles={async (files) => {
          const file = files[0];
          /*
            Кадр вынимается из ролика параллельно отправке, а не до неё:
            телефонный `.mov` браузер разбирает не мгновенно, а иногда не
            умеет вовсе, и ждать этого перед отправкой сорока мегабайт
            незачем. Не вышло — превью просто не будет, ролик поедет как ехал.
          */
          const frame = videoThumb(file).then((blob) => {
            if (blob) showShot(URL.createObjectURL(blob));
            return blob;
          });
          const src = await video.send(file);
          const blob = await frame;
          if (!src) return;
          // Кадр запоминается под путём готового ролика: пока он едет на сайт,
          // панель показывает на его месте эту картинку — и после F5 тоже.
          await rememberPreview(src, blob);
          onDone(src);
        }}
      />
      {shot ? (
        <span className="mt-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot} alt="" className="h-14 w-20 border border-line object-cover" />
          <span className="text-xs text-muted">
            {busy ? "Этот ролик заливается" : video.stage === "failed" ? "Этот ролик не доехал" : "Ролик загружен"}
          </span>
        </span>
      ) : null}
      {video.note ? (
        <p className={`mt-2 text-xs ${video.stage === "failed" ? "text-ink" : "text-muted"}`}>{video.note}</p>
      ) : null}
      {video.stage === "sending" ? <Progress percent={video.percent} /> : null}
      {video.stage === "working" ? <Working label="Сжимаю ролик, это минута-две" /> : null}
    </div>
  );
}

/** Классы вида `object-cover` относятся к самому файлу, а не к рамке вокруг него. */
const FIT = /^object-(cover|contain|fill|none|scale-down)$/;

/** Через сколько пробовать достать файл с сайта заново и сколько раз. */
const RETRY_MS = 30000;
const RETRIES = 40;

/**
 * Адрес файла на сайте. На повторных попытках к нему приписывается номер
 * попытки: без этого браузер отдаёт уже полученный отказ из своей памяти и
 * никуда не ходит.
 */
function retryUrl(src: string, attempt: number) {
  const url = mediaUrl(src);
  return attempt ? `${url}${url.includes("?") ? "&" : "?"}try=${attempt}` : url;
}

/**
 * Обложка ролика — картинка рядом с ним: `back-7.mp4` → `back-7.jpg`.
 *
 * Их делает `tools/make-posters.mjs` для готовых роликов и рабочий процесс
 * сжатия — для каждого нового. Обложка весит сорок килобайт и рисуется как
 * обычная картинка: браузеру не надо ни скачивать ролик, ни уметь его
 * раскодировать. Нет такого файла — ниже есть запасные пути.
 */
function posterFile(src: string) {
  return src.replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg");
}

/**
 * Адрес ролика с отметкой времени — `#t=0.5`.
 *
 * Проигрыватель без обложки рисует чёрный прямоугольник: браузер сам кадр
 * не показывает, пока ролик не тронули. Именно поэтому в «Бэкстейдже»
 * половина клеток была чёрной — это не поломанные файлы, это 29 роликов
 * из 49. С отметкой времени браузер отматывает ролик на полсекунды и
 * рисует настоящий кадр (полсекунды, а не начало: первый кадр часто чёрный
 * сам по себе).
 *
 * У только что загруженных роликов обложка своя — кадр, снятый в браузере
 * при загрузке; там отметка не нужна.
 */
function videoFrameUrl(url: string) {
  return url.includes("#") ? url : `${url}#t=0.5`;
}

/**
 * Миниатюра файла.
 *
 * Три слоя, и все три нужны:
 *
 * 1. Мини-копия загруженного файла (`usePreview`). Она лежит в браузере и
 *    переживает обновление страницы. Пока настоящий файл едет на сайт —
 *    несколько минут, — заказчица видит то, что залила, а не пустое место.
 * 2. Сам файл с боевого сайта. Доехал — рисуется поверх мини-копии; разницы
 *    на глаз нет, это одна и та же картинка.
 * 3. Подпись, если файла на сайте ещё нет. Раньше на этом месте браузер
 *    рисовал значок битой картинки, и вывод напрашивался сам: обложка
 *    слетела. Она никуда не девалась — просто ещё едет.
 *
 * Ролик показывается проигрывателем, а мини-копия идёт ему обложкой: без неё
 * он выглядит чёрным прямоугольником, пока не доедет.
 */
export function Thumb({ src, className = "" }: { src: string; className?: string }) {
  const preview = usePreview(src);
  const [missing, setMissing] = useState(false);
  /** Браузер файл получил, но показать не может: незнакомый кодек. */
  const [unplayable, setUnplayable] = useState(false);
  /** Картинки-обложки рядом с роликом нет — показываем сам ролик. */
  const [noPoster, setNoPoster] = useState(false);
  /** Клетка побывала на экране: до этого ролик не трогаем. */
  const [seen, setSeen] = useState(false);
  /** Которая по счёту попытка достать файл с сайта. */
  const [attempt, setAttempt] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const video = isVideoFile(src);

  // Сменился файл — пробуем снова: прошлый мог не доехать, этот может быть
  // на месте.
  useEffect(() => {
    setMissing(false);
    setUnplayable(false);
    setNoPoster(false);
    setAttempt(0);
  }, [src]);

  /*
    Проигрыватель заводится, только когда клетка доехала до экрана.

    В «Бэкстейдже» тридцать роликов; тридцать проигрывателей, разом
    полезших за своими файлами, — это минуты ожидания и десятки мегабайт
    по мобильной сети. У фотографий то же самое делает сам браузер
    (loading="lazy"), у роликов такого нет.
  */
  useEffect(() => {
    if (!video || preview || seen || !noPoster) return;
    const node = boxRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return setSeen(true);
    const watcher = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          watcher.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    watcher.observe(node);
    return () => watcher.disconnect();
  }, [video, preview, seen, noPoster]);

  /*
    Кадр с ролика снимается один раз и ложится в хранилище браузера. Дальше
    миниатюра — обычная картинка в несколько килобайт, и за файлом ролика
    панель больше не ходит вовсе.

    Не вышло (сайт не разрешил читать чужой файл — заголовок в
    `public/.htaccess`) — останется кадр из самого проигрывателя.
  */
  useEffect(() => {
    if (!src || !video || preview || missing || unplayable || !seen || !noPoster) return;
    capturePoster(src, mediaUrl(src));
  }, [src, video, preview, missing, unplayable, seen, noPoster]);

  /*
    Файла на сайте ещё нет — пробуем снова через полминуты, пока выкладка
    не доедет (3–5 минут; ждём с запасом двадцать).

    Перепроверяются только те файлы, чью мини-копию помнит этот браузер, то
    есть загруженные только что. Иначе панель с восемьюстами кадрами, у
    которой пропала связь с сайтом, ходила бы за всеми ними каждые полминуты.
  */
  useEffect(() => {
    if (!missing || !preview || attempt >= RETRIES) return;
    const timer = window.setTimeout(() => {
      setMissing(false);
      setAttempt((value) => value + 1);
    }, RETRY_MS);
    return () => window.clearTimeout(timer);
  }, [missing, preview, attempt]);

  /*
    Пустое место — цвета страницы, а не почти чёрное. Чёрные прямоугольники
    в списке читаются как поломка, хотя означают всего лишь «файл сюда не
    выбран».
  */
  if (!src) {
    return (
      <div className={`flex items-center justify-center border border-line bg-paper px-1 text-center text-[10px] leading-tight text-muted ${className}`}>
        Файл не выбран
      </div>
    );
  }

  const classes = className.split(/\s+/).filter(Boolean);
  const fit = classes.find((item) => FIT.test(item)) ?? "object-cover";
  const box = classes.filter((item) => !FIT.test(item)).join(" ");
  // Подложку задаёт вызывающий, если ему нужна своя (белая под коллажами).
  const ground = classes.some((item) => item.startsWith("bg-")) ? "" : "bg-paper";

  return (
    <div ref={boxRef} className={`relative overflow-hidden ${ground} ${box}`}>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" aria-hidden className={`absolute inset-0 h-full w-full ${fit}`} />
      ) : null}

      {/*
        Обложка ролика уже есть — показываем её картинкой, а проигрыватель
        не заводим вовсе: в клетке 80×80 ролики не смотрят, а файл он тянет
        настоящий. Что это ролик, видно по значку.
      */}
      {video && (preview || !noPoster) ? (
        <span className="absolute right-1 bottom-1 bg-ink/70 px-1 text-[10px] leading-tight text-snow">▶</span>
      ) : null}

      {/*
        Ролик без своей мини-копии: сначала пробуем картинку-обложку рядом с
        ним. Её нет (старый ролик, обложки ещё не сделали) — заводим
        проигрыватель, он покажет кадр сам.
      */}
      {video && !preview && !noPoster && !missing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={retryUrl(posterFile(src), attempt)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setNoPoster(true)}
          className={`absolute inset-0 h-full w-full ${fit}`}
        />
      ) : null}

      {missing || unplayable || (video && !noPoster && !preview) ? null : video ? (
        preview || !seen ? null : (
          <video
            key={attempt}
            src={videoFrameUrl(retryUrl(src, attempt))}
            className={`absolute inset-0 h-full w-full ${fit}`}
            muted
            playsInline
            preload="metadata"
            /*
              Отметка `#t=0.5` в адресе — просьба показать кадр с половины
              секунды, но её понимают не все браузеры. Здесь то же самое
              делается руками: как только известна длительность, ролик
              отматывается — и рисуется настоящий кадр, а не чернота.
            */
            onLoadedMetadata={(event) => {
              const node = event.currentTarget;
              if (node.currentTime > 0.05) return;
              const at = Math.min(0.5, (Number.isFinite(node.duration) ? node.duration : 1) / 3);
              if (at > 0) node.currentTime = at;
            }}
            onError={(event) => {
              // 3 — не смог раскодировать, 4 — не знает такого кодека. Файл
              // при этом на месте: писать «появится через пару минут» нельзя,
              // это неправда.
              const code = event.currentTarget.error?.code ?? 0;
              if (code === 3 || code === 4) setUnplayable(true);
              else setMissing(true);
            }}
          />
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={attempt}
          src={retryUrl(src, attempt)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setMissing(true)}
          className={`absolute inset-0 h-full w-full ${fit}`}
        />
      )}

      {unplayable ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 border border-line bg-paper text-[10px] leading-tight text-muted">
          <span className="text-base">▶</span>
          Ролик
        </span>
      ) : null}
      {missing && preview ? (
        <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1 py-0.5 text-center text-[9px] leading-tight text-snow">
          Загружено, едет на сайт
        </span>
      ) : null}
      {missing && !preview ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center border border-line bg-paper px-2 text-center text-[10px] leading-tight text-muted">
          Файл сохранён,
          <br />
          появится на сайте
          <br />
          через пару минут
        </span>
      ) : null}
    </div>
  );
}

export function Arrows({ onUp, onDown, disabled, horizontal }: { onUp: () => void; onDown: () => void; disabled?: boolean; horizontal?: boolean }) {
  return (
    <>
      <button type="button" className={BTN_TEXT} disabled={disabled} onClick={onUp} aria-label="Выше">
        {horizontal ? "←" : "↑"}
      </button>
      <button type="button" className={BTN_TEXT} disabled={disabled} onClick={onDown} aria-label="Ниже">
        {horizontal ? "→" : "↓"}
      </button>
    </>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4">
      <div className="mx-auto max-w-2xl bg-paper p-5">
        <p className="eyebrow">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function move<T>(list: T[], index: number, dir: -1 | 1) {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export const DRAG_HINT = "Порядок меняется перетаскиванием: мышью, а на телефоне — нажать, подержать и вести пальцем. Стрелки тоже работают.";
