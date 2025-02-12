import DarkMode from "../../DarkMode";
import {
  // BuildingIcon,
  HeartIcon,
  SearchIcon,
  ShoppingBag,
  UserCircleIcon,
} from "../../../icons";

const UserMenuIcons = () => {
  return (
    <div className="flex gap-2 md:gap-3 lg:gap-5">
      {/* Search Icon (Hidden on SM & XL screens) */}
      <span className="sm:hidden lg:block xl:hidden">
        <SearchIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </span>
      <span>
        <UserCircleIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </span>
      {/* <span>
        <BuildingIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </span> */}
      <span>
        <ShoppingBag className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </span>
      <span>
        <HeartIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
      </span>
      <span>
        <DarkMode />
      </span>
    </div>
  );
};

export default UserMenuIcons;
