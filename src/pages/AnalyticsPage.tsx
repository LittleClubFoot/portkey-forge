import { ScrollText } from "lucide-react";
import { useDeviceStore } from "../stores/deviceStore";
import Dashboard from "../components/Analytics/Dashboard";

export default function AnalyticsPage() {
  const device = useDeviceStore((s) => s.connectedDevice);

  if (!device) {
    return (
      <div className="text-center py-16">
        <ScrollText size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Chronicle</h2>
        <p className="text-gray-500">Link a Portkey Player to view playback history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="page-header">Chronicle</h2>
      <Dashboard />
    </div>
  );
}
