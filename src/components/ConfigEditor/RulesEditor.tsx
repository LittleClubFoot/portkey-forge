import { useState, useEffect, useCallback } from "react";
import { Clock, Shield, List, Plus, X } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";
import type { ParentalControls } from "../../types/config";

const ALL_CATEGORIES = ["movies", "shows", "music", "other"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  movies: "Movies",
  shows: "TV Shows",
  music: "Music",
  other: "Other",
};

const DEFAULT_CONTROLS: ParentalControls = {
  quiet_hours: { start: "21:00", end: "07:00" },
  daily_limit_minutes: 120,
  bedtime_content: [],
  allowed_categories: ["movies", "shows", "music", "other"],
};

interface ValidationErrors {
  quietHours?: string;
  dailyLimit?: string;
}

export default function RulesEditor() {
  const { config, save, isSaving } = useConfig();

  const [startTime, setStartTime] = useState("21:00");
  const [endTime, setEndTime] = useState("07:00");
  const [dailyLimit, setDailyLimit] = useState(120);
  const [bedtimeContent, setBedtimeContent] = useState<string[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([
    ...ALL_CATEGORIES,
  ]);
  const [newContentItem, setNewContentItem] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saved, setSaved] = useState(false);

  // Sync form state from config
  useEffect(() => {
    if (config?.parental_controls) {
      const pc = config.parental_controls;
      setStartTime(pc.quiet_hours?.start ?? "21:00");
      setEndTime(pc.quiet_hours?.end ?? "07:00");
      setDailyLimit(pc.daily_limit_minutes ?? 120);
      setBedtimeContent([...pc.bedtime_content]);
      setAllowedCategories([...pc.allowed_categories]);
    }
  }, [config]);

  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate quiet hours: start must differ from end
    if (startTime === endTime) {
      newErrors.quietHours = "Start and end times must be different.";
    }

    // For same-day interpretation: start should be before end
    // But quiet hours typically span midnight, so we only warn if identical
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (startMins === endMins) {
      newErrors.quietHours = "Start and end times must be different.";
    }

    if (dailyLimit <= 0) {
      newErrors.dailyLimit = "Daily limit must be greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [startTime, endTime, dailyLimit]);

  const handleSave = async () => {
    if (!validate() || !config) return;

    const updatedControls: ParentalControls = {
      quiet_hours: { start: startTime, end: endTime },
      daily_limit_minutes: dailyLimit,
      bedtime_content: bedtimeContent,
      allowed_categories: allowedCategories,
    };

    await save({ ...config, parental_controls: updatedControls });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setStartTime(DEFAULT_CONTROLS.quiet_hours!.start);
    setEndTime(DEFAULT_CONTROLS.quiet_hours!.end);
    setDailyLimit(DEFAULT_CONTROLS.daily_limit_minutes!);
    setBedtimeContent([...DEFAULT_CONTROLS.bedtime_content]);
    setAllowedCategories([...DEFAULT_CONTROLS.allowed_categories]);
    setErrors({});
  };

  const addContentItem = () => {
    const trimmed = newContentItem.trim();
    if (trimmed && !bedtimeContent.includes(trimmed)) {
      setBedtimeContent((prev) => [...prev, trimmed]);
      setNewContentItem("");
    }
  };

  const removeContentItem = (item: string) => {
    setBedtimeContent((prev) => prev.filter((c) => c !== item));
  };

  const toggleCategory = (category: string) => {
    setAllowedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <p className="text-sm">No configuration loaded. Connect a device first.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
          <Shield className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Parental Controls
          </h2>
          <p className="text-sm text-gray-500">
            Configure rules for content access and usage limits.
          </p>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Quiet Hours</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quiet-start"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Start Time
            </label>
            <input
              id="quiet-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="quiet-end"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              End Time
            </label>
            <input
              id="quiet-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        {errors.quietHours && (
          <p className="mt-2 text-xs text-red-600">{errors.quietHours}</p>
        )}
      </div>

      {/* Daily Limit */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Daily Limit (minutes)
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={480}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200
                       accent-blue-600"
          />
          <input
            type="number"
            min={1}
            max={480}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 text-center
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {Math.floor(dailyLimit / 60)}h {dailyLimit % 60}m per day
        </p>
        {errors.dailyLimit && (
          <p className="mt-1 text-xs text-red-600">{errors.dailyLimit}</p>
        )}
      </div>

      {/* Bedtime Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <List className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Bedtime Content
          </h3>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newContentItem}
            onChange={(e) => setNewContentItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addContentItem();
              }
            }}
            placeholder="Add content title..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                       placeholder:text-gray-400
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addContentItem}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm
                       font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {bedtimeContent.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            No bedtime content items added.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {bedtimeContent.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <span className="text-sm text-gray-700">{item}</span>
                <button
                  onClick={() => removeContentItem(item)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500
                             transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Allowed Categories */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Allowed Categories
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ALL_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5
                         cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={allowedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {CATEGORY_LABELS[cat]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm
                     font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-5 py-2.5 text-sm
                     font-medium text-gray-800 hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          Reset to Defaults
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
