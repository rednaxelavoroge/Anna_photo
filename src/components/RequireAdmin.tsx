"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/login", { cache: "no-store" });
        const json = (await res.json()) as { authenticated?: boolean };
        if (!json.authenticated) {
          router.replace("/admin/login");
          if (!cancelled) setError("Нужен вход в панель");
          return;
        }
        if (!cancelled) setOk(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Не удалось проверить вход");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error && !ok) {
    return (
      <div className="mx-auto max-w-md px-5 py-24">
        <p className="text-sm text-muted">{error}</p>
        <Link href="/admin/login" className="mt-6 inline-block text-xs uppercase">
          Перейти ко входу
        </Link>
      </div>
    );
  }

  if (!ok) return <p className="px-5 py-24 text-sm text-muted">Загрузка…</p>;
  return <>{children}</>;
}
