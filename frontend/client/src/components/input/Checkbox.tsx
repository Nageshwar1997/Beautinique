const Checkbox = ({
  onChange,
  checked,
}: {
  onChange: () => void;
  checked: boolean;
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        name="remember"
        type="checkbox"
        className="sr-only peer outline-none"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-10 h-6 bg-primary-inverted-50 rounded-full peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default Checkbox;
