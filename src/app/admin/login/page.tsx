"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5">
      <p className="eyebrow">Студия Анны Манасарян</p>
      <h1 className="mt-4 font-display text-4xl">Панель управления</h1>
      <p className="mt-4 text-sm text-muted">Введите пароль для управления кадрами, разделами и контактами</p>
      <form
        className="mt-10"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password }),
            });
            const json = (await res.json()) as { error?: string };
            if (!res.ok) throw new Error(json.error || "Неверный пароль");
            router.push("/admin");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка входа");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-[10px] tracking-[0.2em] text-muted uppercase">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full border border-line bg-surface px-3 py-3"
          autoFocus
        />
        {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-ink py-3 text-xs tracking-[0.18em] text-snow uppercase">
          Войти в кабинет →
        </button>
      </form>
      <Link href="/" className="mt-8 text-xs text-muted">
        ← Вернуться на сайт
      </Link>
    </div>
  );
}
