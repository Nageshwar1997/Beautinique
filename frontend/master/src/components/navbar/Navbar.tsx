import Button from "../button/Button";
import DarkMode from "../DarkMode";

const Navbar = () => {
  return (
    <div className="h-16 w-full px-2 flex items-center justify-between bg-tertiary-inverted text-tertiary shadow-lg shadow-tertiary-inverted rounded-lg">
      <p>Hello, Nageshwar</p>
      <div className="flex items-center gap-8">
        <DarkMode />
        <Button
          content="Manage Account"
          pattern="primary"
          className="max-w-[180px] !rounded-[10px] !py-2 "
        />
      </div>
    </div>
  );
};

export default Navbar;
