"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Загрузка ролика из панели: отправка, ожидание сжатия, готовый файл.
 *
 * Отправка идёт через XMLHttpRequest, а не fetch, по одной причине: только он
 * рассказывает о ходе загрузки. Без процентов сорок мегабайт с телефона
 * выглядят как зависшая панель, и человек жмёт кнопку второй раз — получая
 * второй такой же ролик.
 *
 * После отправки ролик сжимает машина сборки, это минута-две. Всё это время
 * панель спрашивает про его судьбу и показывает, на чём дело стоит.
 */

/** Как часто спрашивать про судьбу ролика. Чаще незачем: сжатие небыстрое. */
const POLL_MS = 5000;

/** Сколько ждать сжатия. Дольше — значит что-то пошло не так. */
const WAIT_MS = 12 * 60 * 1000;

export type VideoStage = "idle" | "sending" | "working" | "failed";

export type VideoUpload = {
  stage: VideoStage;
  /** Процент отправки, пока stage === "sending". */
  percent: number;
  /** Что показать человеку прямо сейчас. Пустая строка — показывать нечего. */
  note: string;
  /** Отправляет ролик и ждёт готовый. Возвращает путь к нему или null. */
  send: (file: File) => Promise<string | null>;
};

function post(file: File, onProgress: (percent: number) => void): Promise<{ job?: string; error?: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/videos");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText) as { job?: string; error?: string });
      } catch {
        resolve({ error: "Панель не поняла ответ сервера" });
      }
    };
    xhr.onerror = () => resolve({ error: "Связь оборвалась. Попробуйте ещё раз." });
    xhr.send(form);
  });
}

export function useVideoUpload(): VideoUpload {
  const [stage, setStage] = useState<VideoStage>("idle");
  const [percent, setPercent] = useState(0);
  const [note, setNote] = useState("");
  // Ролик отправляется один за раз: две отправки разом на общем хостинге
  // ничем не лучше, а перепутать ответы легко.
  const busy = useRef(false);

  const send = useCallback(async (file: File): Promise<string | null> => {
    if (busy.current) {
      setNote("Дождитесь, пожалуйста, предыдущий ролик.");
      return null;
    }
    busy.current = true;
    setStage("sending");
    setPercent(0);
    setNote("Отправляю ролик…");

    try {
      const started = await post(file, (value) => {
        setPercent(value);
        setNote(value < 100 ? `Отправляю ролик… ${value}%` : "Ролик отправлен, готовлю…");
      });

      if (started.error || !started.job) {
        setStage("failed");
        setNote(started.error || "Ролик не удалось отправить");
        return null;
      }

      setStage("working");
      setNote("Сжимаю ролик — это минута-две, панель можно не закрывать.");

      const until = Date.now() + WAIT_MS;
      while (Date.now() < until) {
        await new Promise((done) => setTimeout(done, POLL_MS));
        const res = await fetch(`/api/admin/videos?job=${encodeURIComponent(started.job)}`, {
          cache: "no-store",
        }).catch(() => null);
        if (!res || !res.ok) continue;

        const body = (await res.json().catch(() => null)) as
          | { state?: string; src?: string; error?: string; sizeMb?: number }
          | null;
        if (!body) continue;

        if (body.state === "done" && body.src) {
          setStage("idle");
          setNote(body.sizeMb ? `Ролик готов, ${body.sizeMb} МБ.` : "Ролик готов.");
          return body.src;
        }
        if (body.state === "failed") {
          setStage("failed");
          setNote(body.error || "Ролик не удалось подготовить");
          return null;
        }
      }

      setStage("failed");
      setNote("Ролик готовится дольше обычного. Загляните сюда через несколько минут.");
      return null;
    } finally {
      busy.current = false;
    }
  }, []);

  return { stage, percent, note, send };
}
