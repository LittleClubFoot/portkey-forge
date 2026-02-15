import { BarChart3 } from "lucide-react";
import { useDeviceStore } from "../stores/deviceStore";
import Dashboard from "../components/Analytics/Dashboard";

export default function AnalyticsPage() {
  const device = useDeviceStore((s) => s.connectedDevice);

  if (!device) {
    return (
      <div className="text-center py-16">
        <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Analytics</h2>
        <p className="text-gray-500">Connect a device to view playback analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="page-header">Analytics</h2>
      <Dashboard />
    </div>
  );
}
