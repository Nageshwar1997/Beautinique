import React from "react";
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
    link: "https://youtu.be/92kcChL74ZE?si=e63hRhe9zrOKm_8w",
  },
  {
    id: 2,
    icon: ChatIcon,
    label: "Chat with our team",
    link: "/contact-us",
  },
];

const ForYou = () => {
  console.log("foryou", for_you);
  return (
    <div className="lg:p-px lg:bg-primary-50 light:lg:bg-primary-inverted-50 lg:rounded-2xl w-full h-full backdrop-blur-3xl max-">
      <div className="bg-platinum-black text-secondary lg:w-full lg:p-5 lg:bg-secondary-inverted lg:rounded-2xl lg:font-metropolis">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4">
          {for_you?.subCategories?.map((category, index) => {
            return (
              <div key={index} className="">
                {/* Desktop View */}
                <div className="hidden lg:flex lg:flex-col lg:gap-6">
                  <p className="uppercase text-battleship-davys-gray-inverted text-sm font-semibold font-degular tracking-wide leading-5 pl-3">
                    {category?.heading}
                  </p>
                  <div className="flex flex-col gap-1 p-3 hover:bg-tertiary-inverted rounded-2xl cursor-pointer group relative">
                    <p className="text-silver-jet text-base font-semibold leading-5 group-hover:text-primary">
                      {category?.label}
                    </p>
                    <p className="group-hover:text-silver-jet text-battleship-davys-gray-inverted text-xs font-normal tracking-tight leading-5 line-clamp-2">
                      {category.description}
                    </p>

                    <div className="relative max-w-[250px] h-[150px] lg:mt-1 overflow-hidden rounded-lg bg-platinum-black group-hover:bg-smoke-eerie">
                      <ImageCadDots className="w-full h-full [&>g]:fill-smoke-eerie-inverted p-1" />
                      <video
                        src={category.videoUrl}
                        className="w-full h-full object-cover absolute top-5 left-5 rounded-md transform group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-300"
                        autoPlay
                        loop
                        muted
                        controls={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                {/* Remaining */}
              </div>
            );
          })}
        </div>
        {/* Only show the section below on desktop */}
        <div className="hidden lg:block">
          <div className="border border-primary-50 rounded-[20px] my-4" />
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
                    <Icon className="w-5 h-5 fill-battleship-davys-gray-inverted group-hover:fill-tertiary" />
                    <span className="text-sm font-normal leading-[21px] text-battleship-davys-gray-inverted group-hover:text-tertiary">
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
              <Link to={"register"}>
                <Button
                  content="Register"
                  pattern="outline"
                  className="text-secondary hover:bg-secondary hover:text-tertiary-inverted border border-tertiary !rounded-lg lg:py-2 shadow-md"
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
