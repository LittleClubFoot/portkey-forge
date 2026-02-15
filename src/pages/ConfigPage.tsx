import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useDeviceStore } from "../stores/deviceStore";
import RulesEditor from "../components/ConfigEditor/RulesEditor";
import NASSettings from "../components/ConfigEditor/NASSettings";
import GeneralSettings from "../components/ConfigEditor/GeneralSettings";

export default function ConfigPage() {
  const device = useDeviceStore((s) => s.connectedDevice);
  const [activeTab, setActiveTab] = useState<"rules" | "nas" | "general">("general");

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "rules" as const, label: "Parental Controls" },
    { id: "nas" as const, label: "NAS Settings" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="page-header">Spellbook</h2>

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "rules" && (
        device ? (
          <RulesEditor />
        ) : (
          <div className="card text-center py-8">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Link a Portkey Player to edit parental controls.</p>
          </div>
        )
      )}
      {activeTab === "nas" && (
        device ? (
          <NASSettings />
        ) : (
          <div className="card text-center py-8">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Link a Portkey Player to configure NAS settings.</p>
          </div>
        )
      )}
    </div>
  );
}
