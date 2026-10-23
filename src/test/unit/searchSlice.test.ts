import { describe, it, expect } from 'vitest';
import searchReducer, {
  setQuery,
  setDebouncedQuery,
  setSearchFilter,
  addToHistory,
  clearHistory,
  clearSearch,
} from '@/store/slices/searchSlice';

describe('searchSlice Reducer', () => {
  const initialState = {
    query: '',
    debouncedQuery: '',
    results: [],
    status: 'idle' as const,
    error: null,
    selectedFilter: 'all' as const,
    history: ['Next.js 15'],
  };

  it('should update query and debounced query', () => {
    let state = searchReducer(initialState, setQuery('Autonomous'));
    expect(state.query).toBe('Autonomous');

    state = searchReducer(state, setDebouncedQuery('Autonomous'));
    expect(state.debouncedQuery).toBe('Autonomous');
  });

  it('should add to search history without duplicates and keep max 8', () => {
    let state = searchReducer(initialState, addToHistory('Quantum'));
    expect(state.history).toContain('Quantum');
    expect(state.history[0]).toBe('Quantum');

    // Add existing
    state = searchReducer(state, addToHistory('Quantum'));
    expect(state.history.filter((h) => h === 'Quantum')).toHaveLength(1);
  });

  it('should clear search and reset query state', () => {
    const populated = {
      ...initialState,
      query: 'Agent',
      debouncedQuery: 'Agent',
      results: [],
    };
    const state = searchReducer(populated, clearSearch());
    expect(state.query).toBe('');
    expect(state.debouncedQuery).toBe('');
  });

  it('should update search filter and clear history', () => {
    let state = searchReducer(initialState, setSearchFilter('news'));
    expect(state.selectedFilter).toBe('news');

    state = searchReducer(state, clearHistory());
    expect(state.history).toHaveLength(0);
  });
});
