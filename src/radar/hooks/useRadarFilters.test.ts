import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRadarFilters } from './useRadarFilters';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

import { useSearchParams } from 'next/navigation';

describe('useRadarFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty filters when no search params', () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useRadarFilters());

    expect(result.current).toEqual({
      quadrant: undefined,
      product: undefined,
    });
  });

  it('returns quadrant filter when present in search params', () => {
    const mockSearchParams = new URLSearchParams('quadrant=testing');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useRadarFilters());

    expect(result.current).toEqual({
      quadrant: 'testing',
      product: undefined,
    });
  });

  it('returns product filter when present in search params', () => {
    const mockSearchParams = new URLSearchParams('product=membresias-web');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useRadarFilters());

    expect(result.current).toEqual({
      quadrant: undefined,
      product: 'membresias-web',
    });
  });

  it('returns both filters when both are present', () => {
    const mockSearchParams = new URLSearchParams('quadrant=testing&product=membresias-web');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useRadarFilters());

    expect(result.current).toEqual({
      quadrant: 'testing',
      product: 'membresias-web',
    });
  });
});
