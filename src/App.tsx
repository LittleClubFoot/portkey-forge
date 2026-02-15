import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import {
  HardDrive,
  Film,
  Sparkles,
  Tag,
  BookOpen,
  ScrollText,
  Menu,
  X,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { useDeviceStore } from "./stores/deviceStore";

import DeviceList from "./components/DeviceConnection/DeviceList";
import DeviceInfo from "./components/DeviceConnection/DeviceInfo";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import MetadataPage from "./pages/MetadataPage";
import TagsPage from "./pages/TagsPage";
import ConfigPage from "./pages/ConfigPage";
import AnalyticsPage from "./pages/AnalyticsPage";

const navItems = [
  { to: "/device", icon: HardDrive, label: "Portkey Player" },
  { to: "/library", icon: Film, label: "Vault" },
  { to: "/metadata", icon: Sparkles, label: "Enchant" },
  { to: "/tags", icon: Wand2, label: "Portkeys" },
  { to: "/config", icon: BookOpen, label: "Spellbook" },
  { to: "/analytics", icon: ScrollText, label: "Chronicle" },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const device = useDeviceStore((s) => s.connectedDevice);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Film size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Portkey</h1>
              <p className="text-xs text-gray-500">Forge</p>
            </div>
          </div>

          {/* Connection status */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  device ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-600">
                {device ? device.name : "No player linked"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">Portkey Forge v0.1.0</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/device" replace />} />
            <Route
              path="/device"
              element={
                <div className="space-y-6">
                  <h2 className="page-header">Portkey Player</h2>
                  <DeviceInfo />
                  <DeviceList />
                </div>
              }
            />
            <Route path="/library" element={<MediaLibraryPage />} />
            <Route path="/metadata" element={<MetadataPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
