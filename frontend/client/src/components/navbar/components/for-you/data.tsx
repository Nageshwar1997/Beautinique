import { PlayIcon, ChatIcon } from "../../../../icons";
import { SocialCommunityItem } from "../../types";
export const new_new = {
  id: 1,
  level: 2,
  heading: "Latest Trends",
  label: "New",
  category: "new",
  videoUrl:
    "https://res.cloudinary.com/drbhw0nwt/video/upload/sp_auto/v1739693059/videos/wvq939qkdpzgchfpzk2m.m3u8",
  thumbnail:
    "https://www.cosmeticsdesign-asia.com/resizer/v2/DFI3RWMPJJMNBF3E6P4SBJ7HZQ.jpg?auth=474f1eceade4c82457720b986e47fa3a6aea0ea968cc8fa505b74d50fd0353c1&width=1802&height=1013&smart=true",
  description: "Discover new beauty arrivals for a fresh, trendy style.",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "",
      category: "",
      icon: () => <svg />, // not in use only for typescript warning
    },
  ],
};

export const sugar_play = {
  id: 2,
  level: 2,
  heading: "Best Sellers",
  label: "Sugar Play",
  category: "sugar_play",
  videoUrl:
    "https://res.cloudinary.com/drbhw0nwt/video/upload/sp_auto/v1739693059/videos/wvq939qkdpzgchfpzk2m.m3u8",
  description: "Shop beauty products top-rated & loved by enthusiasts.",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "",
      category: "",
      icon: () => <svg />, // not in use only for typescript warning
    },
  ],
};

export const offers = {
  id: 3,
  level: 2,
  heading: "Exclusive Deals",
  label: "Offers",
  category: "offers",
  videoUrl:
    "https://res.cloudinary.com/drbhw0nwt/video/upload/sp_auto/v1739693059/videos/wvq939qkdpzgchfpzk2m.m3u8",
  description: "Grab discounts on premium cosmetics for a limited time.",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "",
      category: "",
      icon: () => <svg />, // not in use only for typescript warning
    },
  ],
};

export const blogs = {
  id: 4,
  level: 2,
  heading: "Beauty Insights",
  label: "Blogs",
  category: "blogs",
  videoUrl:
    "https://res.cloudinary.com/drbhw0nwt/video/upload/sp_auto/v1739693059/videos/wvq939qkdpzgchfpzk2m.m3u8",
  description: "Explore top beauty tips, trends, & skincare routines.",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "",
      category: "",
      icon: () => <svg />, // not in use only for typescript warning
    },
  ],
};

export const socialCommunity: SocialCommunityItem[] = [
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
