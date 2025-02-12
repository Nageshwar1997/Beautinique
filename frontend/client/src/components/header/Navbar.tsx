import { useState, useRef, useEffect } from "react";
import {
  CareIcon,
  CashIcon,
  CloseIcon,
  DropdownIcon,
  GiftCardIcon,
  MenuIcon,
  TrackIcon,
} from "../../icons";
import UserMenuIcons from "./components/UserMenuIcons";
import { data } from "./data/newData";
import SearchInput from "./components/SearchInput";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const { pathname } = useLocation();

  const [isMobileNavbarOpened, setIsMobileNavbarOpened] =
    useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [isContainerHovered, setIsContainerHovered] = useState<boolean>(false);

  const levelOneCategories = data.filter((item) => item.level === 1);

  // Sets the hovered index when mouse enters an element
  const handleMouseEnter = (index: number) => setHoveredIndex(index);

  // Sets container hover state to true when mouse enters the container
  const handleContainerMouseEnter = () => setIsContainerHovered(true);

  // Resets hovered index and container hover state when mouse leaves
  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsContainerHovered(false);
  };

  // Handles the event when the user clicks outside the navbar.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        navbarRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        handleMouseLeave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Disables body scroll when the mobile navbar is opened
  useEffect(() => {
    if (isMobileNavbarOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileNavbarOpened]);

  // Toggles the accordion index: adds index if not present, removes if already active.
  const toggleAccordionIndex = (index: number) => {
    setActiveIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Close navbar when pathname changes
  useEffect(() => {
    setHoveredIndex(null);
    setIsContainerHovered(false);
    setIsMobileNavbarOpened(false);
    setActiveIndices([]);
  }, [pathname]);

  return (
    <div
      className={`h-16 lg:h-[100px] w-full flex justify-between items-center gap-3 sticky top-0 left-0 lg:-top-9 px-2 sm:px-5 md:px-10 bg-tertiary text-tertiary-inverted shadow-lg shadow-primary-inverted-50 z-50`}
      onMouseLeave={handleMouseLeave}
    >
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
        <div className="h-16 flex items-center gap-7 justify-between px-5 relative">
          <div className="flex items-center gap-5">
            {levelOneCategories.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-1 text-sm text-nowrap font-semibold transition-all duration-300 cursor-pointer relative"
                onMouseEnter={() => handleMouseEnter(index)}
              >
                <p
                  className={`${
                    hoveredIndex === index
                      ? "bg-clip-text text-transparent bg-accent-duo"
                      : ""
                  }`}
                >
                  {item.label}
                </p>
                <DropdownIcon
                  className={`${
                    hoveredIndex === index
                      ? "rotate-180 [&>path]:stroke-blue-crayola-c"
                      : ""
                  } transition-all duration-300`}
                />

                <div
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent-duo transition-all duration-300 ease-in-out ${
                    hoveredIndex === index ? "w-full" : "w-0"
                  } rounded-full`}
                />
              </div>
            ))}
          </div>
          <SearchInput />
          <UserMenuIcons />
          {(hoveredIndex !== null || isContainerHovered) && (
            <div
              className={`absolute border left-0 top-16 w-full h-[400px] bg-primary-inverted-50 z-[99]`}
              ref={containerRef}
              onMouseEnter={handleContainerMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex justify-center items-start">
                {hoveredIndex}
                {/* <HoveredContent hoveredIndex={hoveredIndex} /> */}
              </div>
            </div>
          )}
        </div>
      </div>
      <SearchInput className="sm:!flex lg:!hidden" />
      <div className="px-1 sm:px-3 md:px-5 lg:hidden flex items-center gap-5">
        <UserMenuIcons />
        <div
          className=""
          onClick={() => setIsMobileNavbarOpened((prev) => !prev)}
        >
          {isMobileNavbarOpened ? (
            <CloseIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <MenuIcon className="[&>path]:stroke-tertiary-inverted w-5 h-5 md:w-6 md:h-6" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
