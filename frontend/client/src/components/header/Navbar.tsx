import {
  CareIcon,
  CashIcon,
  DropdownIcon,
  GiftCardIcon,
  MoonIcon,
  SearchIcon,
  TrackIcon,
} from "../../icons";
import UserMenuIcons from "./components/UserMenuIcons";
import { data } from "./data/newData";

const Navbar = () => {
  const levelOneCategories = data.filter((item) => item.level === 1);

  return (
    <div className="h-16 lg:h-[100px] w-full flex justify-between items-center gap-3 sticky top-0 left-0 lg:-top-9 px-2 sm:px-5 md:px-10 bg-tertiary">
      <div className="h-12 sm:h-14 md:min-h-16 md:h-full flex items-center justify-center">
        <img
          src="./images/logo/B_Q.png"
          alt="Logo"
          className="object-cover w-fit max-h-16 h-full sticky top-0 left-0"
        />
      </div>
      <div className="w-full h-full px-5 hidden lg:block">
        <div className="h-9 flex items-center justify-between px-5 bg-secondary text-secondary-inverted rounded-b-md">
          <p className="text-sm text-nowrap cursor-pointer lg:opacity-90 hover:opacity-100 transition-all duration-300">
            Beautinique Luxury
          </p>
          <div className="flex items-center gap-3 text-xs">
            <p className="flex items-center gap-0.5 cursor-pointer lg:opacity-90 hover:opacity-100 transition-all duration-300">
              <CashIcon className="w-3.5 h-3.5 pb-px [&>path]:stroke-secondary-inverted" />
              <span className="text-nowrap">BQ Cash</span>
            </p>
            <p className="flex items-center gap-0.5 cursor-pointer lg:opacity-90 hover:opacity-100 transition-all duration-300">
              <GiftCardIcon className="w-3.5 h-3.5 pb-px fill-secondary-inverted" />
              <span className="text-nowrap">Gift Card</span>
            </p>
            <p className="flex items-center gap-0.5 cursor-pointer lg:opacity-90 hover:opacity-100 transition-all duration-300">
              <CareIcon className="w-3.5 h-3.5 pb-px fill-secondary-inverted" />
              <span className="text-nowrap">BQ Care</span>
            </p>
            <p className="flex items-center gap-0.5 cursor-pointer lg:opacity-90 hover:opacity-100 transition-all duration-300">
              <TrackIcon className="w-3.5 h-3.5 pb-px [&>path]:stroke-secondary-inverted" />
              <span className="text-nowrap">Track Orders</span>
            </p>
          </div>
        </div>
        <div className="h-16 flex items-center gap-7 justify-between px-5 bg-tertiary text-tertiary-inverted">
          <div className="flex items-center gap-5">
            {levelOneCategories.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 text-sm text-nowrap font-semibold"
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
              className="w-full h-full pl-4 pr-1 py-1 text-sm focus:outline-none focus:border-none bg-transparent placeholder:text-primary-50"
            />
            <SearchIcon className="w-5 h-5 [&>path]:stroke-primary-50 mr-3" />
          </div>
          <UserMenuIcons />
        </div>
      </div>
      <div className="px-1 sm:px-3 md:px-5 lg:hidden flex items-center gap-3">
        <UserMenuIcons />
        <MoonIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </div>
    </div>
  );
};

export default Navbar;
