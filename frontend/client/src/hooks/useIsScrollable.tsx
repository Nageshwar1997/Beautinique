import { useState, useEffect, useRef } from "react";

const useIsScrollable = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState<boolean>(false);

  useEffect(() => {
    const checkIfScrollable = () => {
      const container = containerRef.current;

      if (container) {
        const isScrollableVertically =
          container.scrollHeight > container.clientHeight;
        const isScrollableHorizontally =
          container.scrollWidth > container.clientWidth;
        setIsScrollable(isScrollableVertically || isScrollableHorizontally);
      }
    };

    // Check on mount
    checkIfScrollable();

    // Optional: Re-check on window resize
    window.addEventListener("resize", checkIfScrollable);
    return () => {
      window.removeEventListener("resize", checkIfScrollable);
    };
  }, []);

  return [containerRef, isScrollable];
};

export default useIsScrollable;
