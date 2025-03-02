import { RefObject } from "react";
import useVerticalScrollable from "../../hooks/useVerticalScrollable";
import { DropdownIcon } from "../../icons";
import { VerticalScrollType } from "../../types";
import { BottomGradient, TopGradient } from "../Gradients";
import { sidebarData } from "./data";

const Sidebar = () => {
  const [showGradient, containerRef] = useVerticalScrollable();

  return (
    <div className="max-w-[250px] w-full h-full bg-tertiary-inverted text-tertiary rounded-lg shadow-lg shadow-secondary-inverted z-50">
      <div className="h-16 w-full px-2">
        <div className="w-full h-full border-b border-primary-50 flex justify-center">
          <img
            src="/images/logo/B_Q.png"
            alt="Logo"
            className="object-cover w-fit h-full"
            draggable={false}
          />
        </div>
      </div>
      <div className="w-full h-full">
        {/* Profile Section */}
        <div className="w-full flex justify-center items-center gap-1 px-2 py-3">
          <div className="min-h-14 min-w-14 max-w-16 max-h-16 overflow-hidden p-px bg-accent-duo rounded-full shadow-primary-btn">
            <img
              src="/images/sidebar/user.png"
              alt="Logo"
              className="object-cover w-full h-full rounded-full"
              draggable={false}
            />
          </div>
          <div className="text-center grow">
            <p className="text-xl font-bold line-clamp-1 text-transparent bg-accent-duo bg-clip-text">
              Nageshwar
            </p>
            <p className="text-xl font-bold line-clamp-1 text-transparent bg-accent-duo bg-clip-text">
              Pawar
            </p>
          </div>
        </div>
        <div className="w-full h-[calc(100%-152px)] relative">
          {(showGradient as VerticalScrollType).top && (
            <TopGradient className="!w-full h-8 from-secondary-inverted rounded-t-lg" />
          )}
          <div
            className="w-full h-full overflow-y-scroll p-2 flex flex-col gap-3 pb-10"
            ref={containerRef as RefObject<HTMLDivElement>}
          >
            {sidebarData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="w-full flex items-center justify-between gap-2 group cursor-pointer p-2 border border-primary-10 rounded-lg hover:bg-primary-inverted-10 shadow-lg hover:shadow-primary-inverted-50 light:hover:shadow-primary-50 hover:scale-[1.02] duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 [&>path]:stroke-tertiary group-hover:[&>path]:stroke-primary" />
                    <p className="text-tertiary group-hover:text-primary text-base">
                      {item.label}
                    </p>
                  </div>
                  <DropdownIcon className="-rotate-90" />
                </div>
              );
            })}
          </div>
          {(showGradient as VerticalScrollType).bottom && (
            <BottomGradient className="!w-full h-8 from-secondary-inverted rounded-b-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
