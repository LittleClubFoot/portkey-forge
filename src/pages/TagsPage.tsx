import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useDeviceStore } from "../stores/deviceStore";
import TagAssignment from "../components/TagManager/TagAssignment";
import TagWriter from "../components/TagManager/TagWriter";
import CardPrinter from "../components/TagManager/CardPrinter";

export default function TagsPage() {
  const device = useDeviceStore((s) => s.connectedDevice);
  const [activeTab, setActiveTab] = useState<"assign" | "write" | "print">("assign");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedMediaPath, setSelectedMediaPath] = useState<string | null>(null);

  if (!device) {
    return (
      <div className="text-center py-16">
        <Wand2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Portkeys</h2>
        <p className="text-gray-500">Link a Portkey Player to manage portkeys.</p>
      </div>
    );
  }

  const tabs = [
    { id: "assign" as const, label: "Assign Tags" },
    { id: "write" as const, label: "Write RFID" },
    { id: "print" as const, label: "Print Cards" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="page-header">Portkeys</h2>

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

      {activeTab === "assign" && <TagAssignment />}
      {activeTab === "write" && <TagWriter tagId={selectedTagId} />}
      {activeTab === "print" && <CardPrinter mediaPath={selectedMediaPath} />}
    </div>
  );
}
