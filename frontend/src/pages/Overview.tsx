import React, { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { useTenant } from "../lib/tenant";
import { api } from "../lib/api";

export default function Overview() {
  const { tenantId, role, tenants, refresh } = useTenant();

  const [health, setHealth] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const h = await api.health();
        setHealth(h);

        // Billing endpoint in your current code was /api/billing/status
        // Your new api.ts doesn't have a billing() helper, so call it directly only if you need it.
        // If this endpoint does NOT exist on backend, it will throw and show the error.
        if (tenantId) {
          // TEMP: comment this out if you don't have billing wired yet
          // const b = await (api as any).request?.("/api/billing/status", { method: "GET" });

          // Safer: just don't call billing until endpoint exists:
          setBilling(null);
        } else {
          setBilling(null);
        }
      } catch (e: any) {
        setErr(e.message || "Failed to load");
      }
    })();
  }, [tenantId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <div className="text-sm text-slate-400">Tenant context + system health.</div>
        </div>

        <button
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
          onClick={() => refresh?.()}
          disabled={!refresh}
          title={!refresh ? "refresh() missing from useTenant()" : "Refresh tenants"}
        >
          Refresh tenants
        </button>
      </div>

      {err && <div className="text-red-300">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Runtime">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap">
            {JSON.stringify(health, null, 2)}
          </pre>
        </Card>

        <Card title="Tenant Context">
          <div className="text-sm text-slate-300">
            tenantId: <span className="text-slate-100">{tenantId || "(none)"}</span>
          </div>
          <div className="text-sm text-slate-300">
            role: <span className="text-slate-100">{role || "(none)"}</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">Tenants: {tenants.length}</div>
          <div className="mt-3">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(billing, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}