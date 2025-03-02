import {
  NightCreamIcon,
  EyeCreamIcon,
  SerumIcon,
  SkinCareKitIcon,
  CleanserIcon,
  FaceWashIcon,
  ExfoliatorIcon,
  SunscreenIcon,
  AquaholicIcon,
  CoffeeCultureIcon,
  CitrusIcon,
  AllIcon,
  SheetMaskIcon,
  FacePackIcon,
} from "../icons";

export const moisturizers = {
  id: 1,
  level: 2,
  label: "Moisturizers",
  category: "moisturizers",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Night Cream",
      category: "night_cream",
      icon: NightCreamIcon,
      description: "Deeply hydrates and repairs tired skin while you sleep.",
    },
    {
      id: 2,
      level: 3,
      label: "Eye Cream",
      category: "eye_cream",
      icon: EyeCreamIcon,
      description: "Reduces puffiness, dark circles, and fine lines quickly.",
    },
    {
      id: 3,
      level: 3,
      label: "Serum",
      category: "serum",
      icon: SerumIcon,
      description: "Nourishes skin with essential vitamins for a radiant glow.",
    },
    {
      id: 4,
      level: 3,
      label: "Skincare Kit",
      category: "skincare_kit",
      icon: SkinCareKitIcon,
      description: "Complete care sets for all skin types and beauty concerns.",
    },
  ],
};
export const cleansing_and_exfoliation = {
  id: 2,
  level: 2,
  label: "Cleansing & Exfoliation",
  category: "cleansing_and_exfoliation",
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
      description: "Removes dead skin cells to reveal a fresh and smooth glow.",
    },
    {
      id: 4,
      level: 3,
      label: "Sunscreen",
      category: "sunscreen",
      icon: SunscreenIcon,
      description: "Shields skin from harmful UV rays and sun damage daily.",
    },
  ],
};
export const natures_blend = {
  id: 3,
  level: 2,
  label: "Nature's Blend",
  category: "natures_blend",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Aquaholic",
      category: "aquaholic",
      icon: AquaholicIcon,
      description: "Hydration-rich formulas to deeply quench dry, dull skin.",
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
};
export const face_mask = {
  id: 4,
  level: 2,
  label: "Face Mask",
  category: "face_mask",
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
};

export const highlightedSkinOptions: string[] = [
  "serum",
  "sunscreen",
  "aquaholic",
  "face_pack",
];
