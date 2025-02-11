import { useEffect, useState, useRef } from "react";
import { navbarCategoryData } from "./data";
import { Category, Subcategory } from "../../types";

const Header = () => {
  const [isHoverOrTop, setIsHoverOrTop] = useState(false);
  const [levelTwoCategories, setLevelTwoCategories] = useState<
    Subcategory[] | []
  >([]);
  const [levelThreeCategories, setLevelThreeCategories] = useState<
    Subcategory[] | []
  >([]);

  // State to check if the header is at the top
  const headerRef = useRef<HTMLElement>(null); // Create a reference for the header

  // Function to handle scroll event
  const handleScroll = () => {
    const header = headerRef.current; // Access the header element via ref
    if (header) {
      const rect = header.getBoundingClientRect();
      // If the top of the header is at the very top of the page, set isHoverOrTop to true
      setIsHoverOrTop(rect.top <= 0); // Adjust the offset based on your header's position
    }
  };

  // Adding scroll event listener on mount and cleaning up on unmount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // Initial check in case the page is already scrolled when it first loads
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  console.log("SubCategories", levelTwoCategories);

  return (
    <div className="w-full h-28 sticky -top-8 z-50">
      <div className="w-full h-8 bg-primary-inverted text-primary text-center content-center">
        <p className="cursor-pointer underline text-xs tracking-widest">
          Use code: TREAT10 and enjoy 10% OFF on all orders
        </p>
      </div>
      <header
        ref={headerRef} // Pass the ref to the header element
        className={`w-full max-h-20 h-20 border flex items-center justify-center gap-24 px-5 transition-all ${
          isHoverOrTop ? "bg-secondary" : "bg-transparent"
        } hover:bg-secondary`}
        onMouseEnter={() => setIsHoverOrTop(true)}
        onMouseLeave={() => setIsHoverOrTop(false)}
      >
        <div className="">
          <img
            src="/images/logo/B_Q.png"
            alt=""
            className="max-h-20 object-contain"
          />
        </div>
        <div className="relative">
          <div
            className={`flex items-center gap-10 text-sm ${
              isHoverOrTop ? "text-secondary-inverted" : "text-seasalt-black"
            }`}
          >
            {navbarCategoryData?.map((item: Category, index) => {
              // const { label, subcategories } = item;
              return (
                <div
                  key={index}
                  onMouseEnter={() =>
                    setLevelTwoCategories(item?.subcategories as Subcategory[])
                  }
                  className="cursor-pointer font-medium group flex flex-col items-start relative"
                >
                  <p>{item?.label}</p>
                  <div className="w-0 h-0.5 bg-accent-duo transition-all duration-500 ease-in-out group-hover:w-full rounded-full" />
                </div>
              );
            })}
            <div className="absolute top-12 w-fit h-fit bg-white flex gap-10 py-3 px-5">
              <div className="border px-2 flex flex-col gap-4">
                {levelTwoCategories?.map((item: Subcategory, index) => {
                  return (
                    <div
                      key={index}
                      onMouseEnter={() =>
                        setLevelThreeCategories(
                          item?.subcategories as Subcategory[]
                        )
                      }
                    >
                      <div className="h-full flex flex-col">
                        <div>{item.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="">
                {levelThreeCategories?.map((item: Subcategory, index) => {
                  return (
                    <div key={index} className="">
                      <div className="h-full flex flex-col">
                        <div>{item.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-white">
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
          <p>5</p>
        </div>
      </header>
    </div>
  );
};

export default Header;
