import "./Loading.css";

const Loading = ({
  className,
  content = "Loading....", // make sure the content length is not bigger than 11
}: {
  className?: string;
  content: string;
}) => {
  return (
    <div className={`container ${className}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rings" />
      ))}
      <div className="absolute loading-text">
        {content
          .split("")
          .splice(0, 11)
          .map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          ))}
      </div>
    </div>
  );
};

export default Loading;
