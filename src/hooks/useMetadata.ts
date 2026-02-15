import { useMetadataStore } from "../stores/mediaStore";

export function useMetadata() {
  const store = useMetadataStore();

  return {
    searchResults: store.searchResults,
    enrichedItems: store.enrichedItems,
    batchProgress: store.batchProgress,
    isSearching: store.isSearching,
    isEnriching: store.isEnriching,
    error: store.error,
    parse: store.parseFilename,
    search: store.searchTMDB,
    autoEnrich: store.autoEnrich,
    enrichWithSelection: store.enrichWithSelection,
    batchEnrich: store.batchEnrich,
    clearResults: store.clearResults,
    clearError: store.clearError,
  };
}
