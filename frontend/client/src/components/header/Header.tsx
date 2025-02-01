import { useEffect, useState, useRef } from "react";

const Header = () => {
  const [isTop, setIsTop] = useState(false); // State to check if the header is at the top
  const headerRef = useRef<HTMLElement>(null); // Create a reference for the header

  // Function to handle scroll event
  const handleScroll = () => {
    const header = headerRef.current; // Access the header element via ref
    if (header) {
      const rect = header.getBoundingClientRect();
      // If the top of the header is at the very top of the page, set isTop to true
      setIsTop(rect.top <= 0); // Adjust the offset based on your header's position
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

  return (
    <div className="w-full h-28 sticky -top-8 z-50">
      <div className="w-full h-8 bg-primary-inverted text-primary text-center content-center">
        <p className="cursor-pointer underline text-xs tracking-widest">
          Use code: TREAT10 and enjoy 10% OFF on all orders
        </p>
      </div>
      <header
        ref={headerRef} // Pass the ref to the header element
        className={`group w-full max-h-20 h-20 border flex items-center justify-center gap-24 px-5 transition-all ${
          isTop ? "bg-secondary" : "bg-transparent"
        } hover:bg-secondary`}
      >
        <div className="">
          <img
            src="/images/logo/B_Q.png"
            alt=""
            className="max-h-20 object-contain"
          />
        </div>
        <div
          className={`flex items-center gap-10 text-sm ${
            isTop ? "text-secondary-inverted" : "text-seasalt-black"
          } group-hover:text-secondary-inverted`}
        >
          <p className="hover:font-semibold cursor-pointer hover:underline">
            New
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Lips
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Eyes
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Face
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Nails
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Skin
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Offers
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Gifting
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Sugar Pop
          </p>
          <p className="hover:font-semibold cursor-pointer hover:underline">
            Sugar Play
          </p>
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
