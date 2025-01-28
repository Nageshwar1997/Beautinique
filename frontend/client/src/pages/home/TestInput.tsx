import React from "react";

const TestInput = () => {
  return (
    <div>
      <input
        type="number"
        className="border number-input"
        onWheel={(event) => event.currentTarget.blur()}
      />
    </div>
  );
};

export default TestInput;
