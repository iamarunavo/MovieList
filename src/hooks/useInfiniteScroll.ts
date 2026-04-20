'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (
  fetchMore: () => Promise<void>,
  hasMore = true,
  threshold = 200
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!hasMore || isFetching || isFetchingRef.current) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold && distanceFromBottom > 0) {
      isFetchingRef.current = true;
      setIsFetching(true);
    }
  }, [hasMore, isFetching, threshold]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    const loadMore = async () => {
      try {
        await fetchMore();
      } finally {
        setTimeout(() => {
          isFetchingRef.current = false;
          setIsFetching(false);
        }, 500);
      }
    };
    loadMore();
  }, [isFetching, fetchMore]);

  return [isFetching, setIsFetching];
};

export default useInfiniteScroll;
