import {
  ChatIcon,
  GiftIcon,
  MakeupKitIcon,
  PlayIcon,
  TestIcon,
  ValueSetsIcon,
} from "../../../icons";
import { LevelOneCategoryType } from "../types";
import About from "../components/about/About";
import Collections from "../components/collections/Collections";
import Eyes from "../components/eyes/Eyes";
import Face from "../components/face/Face";
import ForYou from "../components/for-you/ForYou";
import {
  AllIcon,
  AquaholicIcon,
  CitrusIcon,
  CleanserIcon,
  CoffeeCultureIcon,
  ExfoliatorIcon,
  EyeCreamIcon,
  FacePackIcon,
  FaceWashIcon,
  NightCreamIcon,
  SerumIcon,
  SheetMaskIcon,
  SkinCareKitIcon,
  SunscreenIcon,
} from "../components/icons";
import Lips from "../components/lips/Lips";
import Skin from "../components/skin/Skin";
import { SocialCommunityItem } from "../types";
import { TextItem } from "../../../types";
import {
  bronzers_and_contour,
  cheeks_and_glow,
  concealers_and_correctors,
  face_makeup,
  foundation_by_finish,
  foundation_by_skin_type,
  primers_and_removers,
  setting_and_finishing,
  traditional_and_essentials,
} from "../components/face/data";
import {
  eye_value_set,
  eyebrows,
  eyeliners,
  eyeshadow,
  kohl_and_kajal,
  mascaras,
} from "../components/eyes/data";
import {
  lip_care,
  lipstick_set_and_combo,
  lipsticks,
} from "../components/lips/data";
import { blogs, new_new, offers, sugar_play } from "../components/for-you/data";

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

export const lipstickFeedbacks: TextItem[][] = [
  [
    { text: "Great variety of lipsticks! Loved the" },
    { text: "shades", isHighlighted: true },
    { text: "and" },
    { text: "textures.", isHighlighted: true },
    { text: "Long-lasting", isHighlighted: true },
    {
      text: "and comfortable. Perfect for every occasion. Highly recommended!",
    },
  ],
  [
    { text: "Amazing" },
    { text: "pigmentation", isHighlighted: true },
    { text: "and" },
    { text: "smooth application.", isHighlighted: true },
    { text: "Stays on for hours" },
    { text: "without drying out lips. Definitely a" },
    { text: "must-have!", isHighlighted: true },
    { text: "Long-lasting and" },
    { text: "comfortable.", isHighlighted: true },
  ],
  [
    { text: "Beautiful" },
    { text: "shades", isHighlighted: true },
    { text: "and great" },
    { text: "texture!", isHighlighted: true },
    { text: "Perfect" },
    { text: "matte", isHighlighted: true },
    { text: "finish without feeling heavy. Love the" },
    { text: "Long-lasting", isHighlighted: true },
    { text: "effect! Amazing quality and" },
    { text: "pigmentation.", isHighlighted: true },
  ],

  [
    { text: "Excellent" },
    { text: "color payoff!", isHighlighted: true },
    { text: "Super" },
    { text: "comfortable", isHighlighted: true },
    { text: "to wear all day. My" },
    { text: "go-to lipstick", isHighlighted: true },
    {
      text: "for every event. Worth every penny! Absolutely stunning luxurious.",
    },
  ],
  [
    { text: "Lovely" },
    { text: "shades", isHighlighted: true },
    { text: "with a" },
    { text: "creamy texture.", isHighlighted: true },
    { text: "No" },
    { text: "smudging", isHighlighted: true },
    {
      text: "and lasts all day. Received so many compliments. Absolutely love them! Truly fantastic.",
    },
  ],

  [
    { text: "The" },
    { text: "colors", isHighlighted: true },
    { text: "are vibrant and bold. Great for all" },
    { text: "skin tones.", isHighlighted: true },
    { text: "Stays" },
    { text: "intact", isHighlighted: true },
    { text: "and flawless" },
    { text: "even after meals. Highly recommended! Truly amazing." },
  ],
  [
    { text: "Impressive" },
    { text: "quality", isHighlighted: true },
    { text: "and" },
    { text: "shade range.", isHighlighted: true },
    { text: "Glides" },
    { text: "so" },
    { text: "smoothly", isHighlighted: true },
    {
      text: "and feels so lightweight. Absolutely perfect for both daily wear and special occasions!",
    },
  ],
];

export const for_you: LevelOneCategoryType = {
  id: 1,
  level: 1,
  label: "For You",
  category: "for_you",
  component: ForYou,
  subCategories: [
    new_new, // only new is reserved keyword we can't use new
    sugar_play,
    offers,
    blogs,
  ],
};

export const lips: LevelOneCategoryType = {
  id: 2,
  level: 1,
  label: "Lips",
  category: "lips",
  component: Lips,
  subCategories: [lipsticks, lip_care, lipstick_set_and_combo],
};

export const eyes: LevelOneCategoryType = {
  id: 3,
  level: 1,
  label: "Eyes",
  category: "eyes",
  component: Eyes,
  subCategories: [
    kohl_and_kajal,
    mascaras,
    eyeliners,
    eyeshadow,
    eyebrows,
    eye_value_set,
  ],
};

export const face: LevelOneCategoryType = {
  id: 4,
  level: 1,
  label: "Face",
  category: "face",
  component: Face,
  subCategories: [
    face_makeup,
    traditional_and_essentials,
    cheeks_and_glow,
    setting_and_finishing,
    primers_and_removers,
    bronzers_and_contour,
    concealers_and_correctors,
    foundation_by_skin_type,
    foundation_by_finish,
  ],
};

export const skin: LevelOneCategoryType = {
  id: 5,
  level: 1,
  label: "Skin",
  category: "skin",
  component: Skin,
  subCategories: [
    {
      id: 1,
      level: 2,
      label: "Moisturizers",
      category: "moisturizers",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Night Cream",
          category: "night_cream",
          icon: NightCreamIcon,
          description:
            "Deeply hydrates and repairs tired skin while you sleep.",
        },
        {
          id: 2,
          level: 3,
          label: "Eye Cream",
          category: "eye_cream",
          icon: EyeCreamIcon,
          description:
            "Reduces puffiness, dark circles, and fine lines quickly.",
        },
        {
          id: 3,
          level: 3,
          label: "Serum",
          category: "serum",
          icon: SerumIcon,
          description:
            "Nourishes skin with essential vitamins for a radiant glow.",
        },
        {
          id: 4,
          level: 3,
          label: "Skincare Kit",
          category: "skincare_kit",
          icon: SkinCareKitIcon,
          description:
            "Complete care sets for all skin types and beauty concerns.",
        },
      ],
    },
    {
      id: 2,
      level: 2,
      label: "Cleansing & Exfoliation",
      category: "cleansing_and_exfoliation",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Cleanser",
          category: "cleanser",
          icon: CleanserIcon,
          description:
            "Gently removes dirt, excess oil, and makeup for clean skin.",
        },
        {
          id: 2,
          level: 3,
          label: "Face Wash",
          category: "face_wash",
          icon: FaceWashIcon,
          description:
            "Refreshing daily wash for soft and healthy-looking skin tone.",
        },
        {
          id: 3,
          level: 3,
          label: "Exfoliator & Scrub",
          category: "exfoliator_and_scrub",
          icon: ExfoliatorIcon,
          description:
            "Removes dead skin cells to reveal a fresh and smooth glow.",
        },
        {
          id: 4,
          level: 3,
          label: "Sunscreen",
          category: "sunscreen",
          icon: SunscreenIcon,
          description:
            "Shields skin from harmful UV rays and sun damage daily.",
        },
      ],
    },
    {
      id: 3,
      level: 2,
      label: "Nature's Blend",
      category: "natures_blend",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Aquaholic",
          category: "aquaholic",
          icon: AquaholicIcon,
          description:
            "Hydration-rich formulas to deeply quench dry, dull skin.",
        },
        {
          id: 2,
          level: 3,
          label: "Coffee Culture",
          category: "coffee_culture",
          icon: CoffeeCultureIcon,
          description:
            "Energizing coffee extracts for a firm, smooth, youthful feel.",
        },
        {
          id: 3,
          level: 3,
          label: "Citrus Got Real",
          category: "citrus_got_real",
          icon: CitrusIcon,
          description:
            "Vitamin C boost for brighter, fresher, healthier-looking skin.",
        },
        {
          id: 4,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: AllIcon,
          description:
            "Explore all skincare essentials, perfectly tailored for you.",
        },
      ],
    },
    {
      id: 4,
      level: 2,
      label: "Face Mask",
      category: "face_mask",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Sheet Mask",
          category: "sheet_mask",
          icon: SheetMaskIcon,
          description:
            "Instant hydration and glowing effect in just a few minutes.",
        },
        {
          id: 2,
          level: 3,
          label: "Face Pack",
          category: "face_pack",
          icon: FacePackIcon,
          description:
            "Detox and refresh your skin naturally with herbal extracts.",
        },
        {
          id: 3,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: AllIcon,
          description:
            "Browse all skincare must-haves for a flawless glowing look.",
        },
      ],
    },
  ],
};

export const collections: LevelOneCategoryType = {
  id: 6,
  level: 1,
  label: "Collections",
  category: "collections",
  component: Collections,
  subCategories: [
    {
      id: 1,
      level: 2,
      label: "Gifting",
      category: "gifting",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Lipstick Sets",
          category: "lipstick_sets",
          icon: TestIcon,
        },
        {
          id: 2,
          level: 3,
          label: "Sugar Merch",
          category: "sugar_merch",
          icon: TestIcon,
        },
        {
          id: 3,
          level: 3,
          label: "Value Sets",
          category: "value_sets",
          icon: ValueSetsIcon,
        },
        {
          id: 4,
          level: 3,
          label: "Makeup Kits",
          category: "makeup_kits",
          icon: MakeupKitIcon,
        },
        {
          id: 5,
          level: 3,
          label: "Corporate Gifting",
          category: "corporate_gifting",
          icon: GiftIcon,
        },
        {
          id: 6,
          level: 3,
          label: "Sugar Sets",
          category: "sugar_sets",
          icon: TestIcon,
        },
        {
          id: 7,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: TestIcon,
        },
      ],
    },
    {
      id: 2,
      level: 2,
      label: "Sugar Pop",
      category: "sugar_pop",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Lips",
          category: "lips",
          icon: TestIcon,
        },
        {
          id: 2,
          level: 3,
          label: "Eyes",
          category: "eyes",
          icon: TestIcon,
        },
        {
          id: 3,
          level: 3,
          label: "Face",
          category: "face",
          icon: TestIcon,
        },
        {
          id: 4,
          level: 3,
          label: "Nails",
          category: "nails",
          icon: TestIcon,
        },
        {
          id: 5,
          level: 3,
          label: "Skincare",
          category: "skincare",
          icon: TestIcon,
        },
        {
          id: 6,
          level: 3,
          label: "Body Care",
          category: "body_care",
          icon: TestIcon,
        },
        {
          id: 7,
          level: 3,
          label: "Best of Sugar Pop",
          category: "best_of_sugar_pop",
          icon: TestIcon,
        },
        {
          id: 8,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: TestIcon,
        },
      ],
    },
    {
      id: 3,
      level: 2,
      label: "Bath & Body",
      category: "bath_and_body",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Shower Gels",
          category: "shower_gels",
          icon: TestIcon,
        },
        {
          id: 2,
          level: 3,
          label: "Soaps",
          category: "soaps",
          icon: TestIcon,
        },
        {
          id: 3,
          level: 3,
          label: "Body Lotion",
          category: "body_lotion",
          icon: TestIcon,
        },
        {
          id: 4,
          level: 3,
          label: "Body Sprays",
          category: "body_sprays",
          icon: TestIcon,
        },
        {
          id: 5,
          level: 3,
          label: "Hand Wash",
          category: "hand_wash",
          icon: TestIcon,
        },
        {
          id: 6,
          level: 3,
          label: "Foot Cream",
          category: "foot_cream",
          icon: TestIcon,
        },
        {
          id: 7,
          level: 3,
          label: "Hand Cream",
          category: "hand_cream",
          icon: TestIcon,
        },
        {
          id: 8,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: TestIcon,
        },
      ],
    },
    {
      id: 4,
      level: 2,
      label: "Hair Care",
      category: "hair_care",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "Shampoo",
          category: "shampoo",
          icon: TestIcon,
        },
        {
          id: 2,
          level: 3,
          label: "Conditioner",
          category: "conditioner",
          icon: TestIcon,
        },
        {
          id: 3,
          level: 3,
          label: "Hair Oil",
          category: "hair_oil",
          icon: TestIcon,
        },
        {
          id: 4,
          level: 3,
          label: "Serum",
          category: "serum",
          icon: TestIcon,
        },
        {
          id: 5,
          level: 3,
          label: "Hair Mask",
          category: "hair_mask",
          icon: TestIcon,
        },
        {
          id: 6,
          level: 3,
          label: "Combos",
          category: "combos",
          icon: TestIcon,
        },
        {
          id: 7,
          level: 3,
          label: "View All",
          category: "view_all",
          icon: TestIcon,
        },
      ],
    },
  ],
};

export const about: LevelOneCategoryType = {
  id: 7,
  level: 1,
  label: "About",
  category: "about",
  component: About,
  subCategories: [
    {
      id: 1,
      level: 2,
      heading: "",
      label: "",
      category: "",
      icon: TestIcon,
      subCategories: [
        {
          id: 1,
          level: 3,
          label: "",
          category: "",
          icon: TestIcon,
        },
      ],
    },
  ],
};

export const navbarCategoriesData: LevelOneCategoryType[] = [
  for_you,
  lips,
  eyes,
  face,
  skin,
  collections,
  about,
];
