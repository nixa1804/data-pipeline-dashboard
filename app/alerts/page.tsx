import Header from "@/components/layout/Header";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { mockAlerts } from "@/lib/mock-data";

export default function AlertsPage() {
  const active = mockAlerts.filter((a) => a.status !== "resolved").length;
  return (
    <>
      <Header
        title="Alerts"
        subtitle={`${active} open · ${mockAlerts.length} total`}
      />
      <main className="flex-1 px-6 py-6 max-w-2xl">
        <AlertsPanel alerts={mockAlerts} />
      </main>
    </>
  );
}
