/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { VerticalScrollType } from "../types";

const useVerticalScrollable = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showGradient, setShowGradient] = useState<VerticalScrollType>({
    top: false,
    bottom: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        const hasVerticalScroll =
          container.scrollHeight > container.clientHeight;
        const isAtBeginning = container.scrollTop === 0;
        const isAtEnd =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        if (hasVerticalScroll) {
          setShowGradient({
            top: !isAtBeginning,
            bottom: !isAtEnd,
          });
        } else {
          setShowGradient({ ...showGradient, top: false, bottom: false });
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

export default useVerticalScrollable;
