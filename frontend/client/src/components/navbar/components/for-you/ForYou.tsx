import { FC, Fragment, SVGProps, useState } from "react";
import { for_you } from "../../data/newData";
import Button from "../../../button/Button";
import { Link } from "react-router-dom";
import { ChatIcon, PlayIcon } from "../../../../icons";
import HLSVideoPlayer from "../../../videoPlayers/HLSVideoPlayer";

type IconType = FC<SVGProps<SVGSVGElement>>;

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
  const categories = for_you?.subCategories;
  return (
    <Fragment>
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4">
        {categories?.map((category, index) => {
          return (
            <Fragment key={index}>
              {/* Desktop View */}
              <div className="hidden lg:flex flex-col gap-6">
                <p className="uppercase text-primary-battleship-davys-gray-inverted text-sm font-semibold font-degular tracking-wide leading-5 pl-3">
                  {category?.heading}
                </p>
                <div
                  className="flex flex-col gap-1 p-3 hover:bg-platinum-black rounded-2xl cursor-pointer group relative"
                  onMouseEnter={() => setPlayingVideoIndex(index)}
                >
                  <p className="text-silver-jet text-base font-semibold leading-5 group-hover:text-primary">
                    {category?.label}
                  </p>
                  <p className="group-hover:text-silver-jet text-primary-battleship-davys-gray-inverted text-xs font-normal tracking-tight leading-5 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="relative max-w-[250px] h-[150px] overflow-hidden rounded-lg group-hover:shadow-sm group-hover:shadow-primary-inverted">
                    {playingVideoIndex === index ? (
                      <HLSVideoPlayer
                        className="w-full h-full object-cover"
                        videoUrl={category.videoUrl}
                        posterURL="https://res.cloudinary.com/drbhw0nwt/video/upload/w_1920,h_1080,c_fill,so_1/v1739693059/videos/wvq939qkdpzgchfpzk2m.jpg"
                      />
                    ) : (
                      <img
                        src={
                          "https://res.cloudinary.com/drbhw0nwt/video/upload/so_5/videos/wvq939qkdpzgchfpzk2m.jpg" //LINK - Without width, height, quality & timestamp
                          // "https://res.cloudinary.com/drbhw0nwt/video/upload/w_1920,h_1080,c_fill,so_1/v1739693059/videos/wvq939qkdpzgchfpzk2m.jpg" //LINK - With width, height, quality & timestamp
                        } // Replace with a thumbnail URL
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden p-4 flex justify-between gap-2 w-full border-b border-primary-50">
                <div className="w-1/2 sm:w-2/3 flex flex-col items-start justify-start gap-1 sm:gap-3">
                  <p className="uppercase text-sm font-degular font-semibold tracking-[1px] py-1 border-b border-secondary-battleship-davys-gray text-primary-battleship-davys-gray-inverted">
                    {category.heading}
                  </p>
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
                <div className="relative max-w-[200px] h-[120px] border border-primary-10 w-1/2 sm:w-1/3 overflow-hidden rounded-lg bg-platinum-black group-hover:bg-smoke-eerie flex items-center justify-center">
                  {playingVideoIndex === index ? (
                    <HLSVideoPlayer
                      className="w-full h-full object-cover rounded-lg"
                      videoUrl={category.videoUrl}
                      // posterURL="https://res.cloudinary.com/drbhw0nwt/video/upload/w_1920,h_1080,c_fill,so_1/v1739693059/videos/wvq939qkdpzgchfpzk2m.jpg"
                    />
                  ) : (
                    <>
                      {/* Show Poster */}
                      <img
                        src="https://res.cloudinary.com/drbhw0nwt/video/upload/so_5/videos/wvq939qkdpzgchfpzk2m.jpg"
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                      />
                      {/* Play Button */}
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md"
                        onClick={() => setPlayingVideoIndex(index)}
                      >
                        <PlayIcon className="w-10 h-10 fill-white/50" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
      {/* Only show the section below on desktop */}
      <div className="hidden lg:block">
        <div className="bg bg-primary-50 h-px rounded-full my-6" />
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
    </Fragment>
  );
};

export default ForYou;
