const Checkbox = ({ register }: { register: object }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        name="remember"
        type="checkbox"
        className="sr-only peer outline-none"
        {...register}
      />
      <div className="w-10 md:w-11 h-5 md:h-6 bg-primary-50 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:md:h-4 after:md:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default Checkbox;
