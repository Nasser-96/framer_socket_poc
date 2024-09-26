import { useEffect, useState } from "react";

/**
 * Hook to run code only when window object is available (client-side).
 */
const useWindowIsLoaded = () => {
  const [isWindow, setIsWindow] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsWindow(true);
    }
  }, []);
  return { isWindow };
};

export default useWindowIsLoaded;
