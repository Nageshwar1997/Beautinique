const handleSpacePrevention = (e: KeyboardEvent) => {
  if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
  }
};

const handlePhoneNumberPrevention = (e: KeyboardEvent) => {
  // Allow control keys: backspace, delete, arrow keys, etc.
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

  if (allowedKeys.includes(e.key) || (e.key >= "0" && e.key <= "9")) {
    return; // Allow the input
  }

  e.preventDefault(); // Prevent input if it's not a numeric key
};

const handleNamePrevention = (e: KeyboardEvent) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    " ",
  ];

  if (
    allowedKeys.includes(e.key) ||
    (e.key >= "a" && e.key <= "z") ||
    (e.key >= "A" && e.key <= "Z")
  ) {
    return; // Allow the input
  }

  e.preventDefault(); // Prevent input if it's not a numeric key
};

export {
  handleSpacePrevention,
  handlePhoneNumberPrevention,
  handleNamePrevention,
};
