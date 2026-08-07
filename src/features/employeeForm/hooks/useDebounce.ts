// Debounce Hook
import { useEffect, useRef } from 'react';

export function useDebounce<T>(
  value: T,
  delay: number,
  callback: (value: T) => void
): void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
}