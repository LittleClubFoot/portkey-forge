import { useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
  isLoading = false,
  className,
}: SearchInputProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (!onSearch) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onSearch(query);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedSearch(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange("");
    if (onSearch) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      onSearch("");
    }
  };

  return (
    <div className={clsx("relative", className)}>
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        ) : (
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10",
          "text-sm text-gray-900 placeholder-gray-400",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "transition-colors"
        )}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
