/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { HorizontalScrollType } from "../types";

const useHorizontalScrollable = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showGradient, setShowGradient] = useState<HorizontalScrollType>({
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        const hasHorizontalScroll =
          container.scrollWidth > container.clientWidth;
        const isAtBeginning = container.scrollLeft === 0;
        const isAtEnd =
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 1;

        if (hasHorizontalScroll) {
          setShowGradient({
            left: !isAtBeginning,
            right: !isAtEnd,
          });
        } else {
          setShowGradient({ ...showGradient, left: false, right: false });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef]);

  return [showGradient, containerRef];
};

export default useHorizontalScrollable;
