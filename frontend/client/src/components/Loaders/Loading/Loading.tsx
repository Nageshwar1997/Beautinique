import "./Loading.css";

const Loading = () => {
  return (
    <div className="container">
      <div className="rings"></div>
      <div className="rings"></div>
      <div className="rings"></div>
      <div className="rings"></div>
      <div className="absolute loading-text">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
        <span>.</span>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </div>
  );
};

export default Loading;
