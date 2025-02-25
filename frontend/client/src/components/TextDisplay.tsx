import { Fragment } from "react";
import { TextDisplayProps } from "../types";

const TextDisplay = ({
  content,
  className,
  contentClassName = "",
}: TextDisplayProps) => {
  return (
    <div className={`w-full mx-auto text-5xl leading-tight ${className}`}>
      <span
        className={`flex flex-wrap items-center justify-center text-center font-medium ${contentClassName}`}
      >
        {content.map((item, index) => {
          const words = item.isHighlighted
            ? [item.text.trim()]
            : item.text.trim().split(" ");
          return (
            <Fragment key={index}>
              {words.map((word, wordIndex) => (
                <span
                  key={`${index}-${wordIndex}`}
                  className={`mr-2 bg-clip-text text-transparent ${
                    item.isHighlighted ? "bg-accent-duo" : "bg-silver-duo"
                  }`}
                >
                  {word}
                </span>
              ))}
              {item.break && <div className="basis-full h-0"></div>}
            </Fragment>
          );
        })}
      </span>
    </div>
  );
};

export default TextDisplay;
