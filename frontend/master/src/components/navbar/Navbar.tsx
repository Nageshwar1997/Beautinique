import Button from "../button/Button";

const Navbar = () => {
  return (
    <div className="h-16 max-w-[calc(100%-250px)] w-full lg:gap-0 xl:gap-5 fixed left-[250px] top-0 px-2 sm:px-5 bg-tertiary-inverted text-tertiary shadow-lg shadow-primary-inverted-50 z-50 flex items-center justify-between">
      <p>Hello, Nageshwar</p>
      <Button
        content="Manage Account"
        pattern="primary"
        className="max-w-[180px] !rounded-[10px] !py-2 "
      />
    </div>
  );
};

export default Navbar;
