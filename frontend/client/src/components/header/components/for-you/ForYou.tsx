import React, { useState } from "react";
import { for_you } from "../../data/newData";
import ImageCadDots from "./ImageCadDots";
import Button from "../../../button/Button";
import { Link } from "react-router-dom";
import { ChatIcon, PlayIcon } from "../../../../icons";
type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

interface SocialCommunityItem {
  id: number;
  icon: IconType;
  label: string;
  link: string;
}

const socialCommunity: SocialCommunityItem[] = [
  {
    id: 1,
    icon: PlayIcon,
    label: "Founder's Story: Watch Now",
    link: "https://www.youtube.com/watch?v=92kcChL74ZE",
  },
  {
    id: 2,
    icon: ChatIcon,
    label: "Chat with our team",
    link: "/contact-us",
  },
];

const ForYou = () => {
  const [playingVideoIndex, setPlayingVideoIndex] = useState<null | number>(
    null
  );
  return (
    <div className="lg:p-px lg:bg-primary-battleship-davys-gray lg:rounded-xl w-full h-full backdrop-blur-3xl max-w-[1300px] shadow-navbar-card">
      <div className="bg-platinum-black text-secondary lg:w-full lg:p-5 lg:bg-secondary-inverted lg:rounded-xl lg:font-metropolis">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4">
          {for_you?.subCategories?.map((category, index) => {
            return (
              <div key={index} className="bg-primary-inverted-50">
                {/* Desktop View */}
                <div className="hidden lg:flex flex-col gap-6">
                  <p className="uppercase text-primary-battleship-davys-gray-inverted text-sm font-semibold font-degular tracking-wide leading-5 pl-3">
                    {category?.heading}
                  </p>
                  <div
                    className="flex flex-col gap-1 p-3 hover:bg-platinum-black  rounded-2xl cursor-pointer group relative"
                    onMouseEnter={() => setPlayingVideoIndex(index)}
                  >
                    <p className="text-silver-jet text-base font-semibold leading-5 group-hover:text-primary">
                      {category?.label}
                    </p>
                    <p className="group-hover:text-silver-jet text--primary-battleship-davys-gray-inverted text-xs font-normal tracking-tight leading-5 line-clamp-2">
                      {category.description}
                    </p>

                    <div className="relative max-w-[250px] h-[150px] lg:mt-1 overflow-hidden rounded-lg bg-platinum-black group-hover:bg-smoke-eerie">
                      <ImageCadDots className="w-full h-full [&>g]:fill-smoke-eerie-inverted p-1" />
                      <video
                        src={category.videoUrl}
                        className="w-full h-full object-cover absolute top-5 left-5 rounded-md transform group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-300"
                        loop
                        muted
                        controls={false}
                        ref={(video) => {
                          if (video) {
                            // Play or pause the video based on hover state
                            if (playingVideoIndex === index) {
                              video.play();
                            } else {
                              video.pause();
                              video.currentTime = 0;
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden p-4 flex justify-between gap-2 w-full border-b border-primary-50">
                  <div className="w-1/2 sm:w-2/3 flex flex-col items-start justify-between">
                    <p className="uppercase text-sm font-degular font-semibold tracking-[1px] py-1 border-secondary-battleship-davys-gray text-primary-battleship-davys-gray-inverted">
                      {category.heading}
                    </p>
                    <hr className="border-b border-primary-8 w-full" />
                    <div className="flex gap-4 cursor-pointer justify-between items-center pt-1">
                      <div className="flex gap-1 flex-col items-start">
                        <span className="text-sm leading-5 font-semibold text-[--ctruh-light-primary]">
                          {category.label}
                        </span>
                        <p className="text-[10.5px] sm:text-xs md:text-sm pt-1 leading-[18px] text-light-secondary">
                          {category.description}
                        </p>
                      </div>
                      {/* <DropdownIcon className="-rotate-90 [&>path]:fill-primary" /> */}
                    </div>
                  </div>
                  <div className="max-w-[200px] h-[120px] border border-primary-10 w-1/2 sm:w-1/3 overflow-hidden rounded-lg bg-platinum-black group-hover:bg-smoke-eerie flex items-center justify-center">
                    <video
                      src={category.videoUrl}
                      className="w-full h-full object-cover rounded-md"
                      loop
                      muted
                      autoPlay
                      controls={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Only show the section below on desktop */}
        <div className="hidden lg:block">
          <div className="bg bg-primary-50 h-px rounded-full my-4" />
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex gap-6 items-center font-normal text-sm">
              {socialCommunity.map((data) => {
                const Icon = data.icon;
                return (
                  <Link
                    to={data.link}
                    key={data.id}
                    target="_blank"
                    className="flex gap-2 items-center group"
                  >
                    <Icon className="w-5 h-5 fill-tertiary opacity-70 group-hover:opacity-100" />
                    <span className="text-sm font-normal leading-[21px] text-tertiary opacity-70 group-hover:opacity-100">
                      {data.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-tertiary text-sm font-normal">
                Ready to get started?
              </span>
              <Link to={"/register"}>
                <Button
                  content="Register"
                  pattern="outline"
                  className="!rounded-lg lg:!py-2 shadow-md"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForYou;
