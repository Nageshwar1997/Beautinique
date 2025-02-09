import { DropdownIcon, TestIcon } from "../icons";
import { data } from "./data/newData";

const Navbar = () => {
  const levelOneCategories = data.filter((item) => item.level === 1);

  return (
    <div className="h-[100px] w-full flex justify-between items-center gap-3 sticky -top-9 px-10 bg-tertiary">
      <div className="min-h-[calc(100%-36px)] h-full flex items-center justify-center">
        <img
          src="./images/logo/B_Q.png"
          alt="Logo"
          className="object-cover w-fit max-h-[calc(100%-36px)] sticky top-0"
        />
      </div>
      <div className="w-full h-full px-5">
        <div className="h-9 flex items-center justify-between px-5 bg-secondary text-secondary-inverted rounded-b-md">
          <p className="text-sm text-nowrap">Beautinique Luxury</p>
          <div className="flex items-center gap-3 text-xs">
            <p className="flex items-center gap-1">
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
              <span className="text-nowrap">BQ Cash</span>
            </p>
            <p className="flex items-center gap-1">
              <TestIcon className="!stroke-secondary-inverted fill-secondary-inverted" />
              <span className="text-nowrap">Gift Card</span>
            </p>
            <p className="flex items-center gap-1">
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
              <span className="text-nowrap">BQ Care</span>
            </p>
            <p className="flex items-center gap-1">
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
              <span className="text-nowrap">Track Orders</span>
            </p>
          </div>
        </div>
        <div className="h-[calc(100%-36px)] flex items-center gap-7 justify-between px-5 bg-tertiary text-tertiary-inverted">
          <div className="flex items-center gap-5">
            {levelOneCategories.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 text-sm text-nowrap"
              >
                <p>{item.label}</p>
                <DropdownIcon />
              </div>
            ))}
          </div>
          <div className="flex-grow h-9 hidden rounded-md overflow-hidden bg-secondary xl:flex items-center focus-within:border focus-within:shadow-lg focus-within:shadow-primary-10 focus-within:border-primary-50">
            <input
              type="text"
              placeholder="Search Beautinique"
              className="w-full h-full px-3 py-1 text-sm focus:outline-none focus:border-none bg-transparent placeholder:text-primary-50"
            />
            <TestIcon className="stroke-secondary-inverted fill-secondary-inverted mr-2" />
          </div>
          <div className="flex gap-3">
            {/* Search Icon */}
            <span className="xl:hidden">
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
            <span>
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
            <span>
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
            <span>
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
            <span>
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
            <span>
              <TestIcon className="stroke-secondary-inverted fill-secondary-inverted" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
