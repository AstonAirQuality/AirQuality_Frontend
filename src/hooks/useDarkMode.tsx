// reference: https://github.com/fireship-io/tailwind-dashboard
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) as T : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const useDarkMode = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [enabled, setEnabled] = useLocalStorage<boolean>('dark-theme', false);

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;
    enabled ? bodyClass.add(className) : bodyClass.remove(className);
  }, [enabled]);

  return [enabled, setEnabled];
};

export default useDarkMode;
