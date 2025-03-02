const Sidebar = () => {
  return (
    <div className="border w-[250px] h-full fixed left-0 top-0 bg-tertiary-inverted text-tertiary shadow-lg shadow-primary-inverted-50 z-50">
      <div className="h-16 w-full border flex justify-center">
        <img
          src="./images/logo/B_Q.png"
          alt="Logo"
          className="object-cover w-fit h-full"
        />
      </div>
    </div>
  );
};

export default Sidebar;
