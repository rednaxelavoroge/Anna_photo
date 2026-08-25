"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/login");
      const json = (await res.json()) as { authenticated?: boolean };
      if (!json.authenticated) {
        router.replace("/admin/login");
        return;
      }
      setOk(true);
    })();
  }, [router]);

  if (!ok) return <p className="px-5 py-24 text-sm text-muted">Загрузка…</p>;
  return <>{children}</>;
}
