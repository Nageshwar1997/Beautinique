import {
  BananaPowderIcon,
  BBCreamIcon,
  BestForDrySkinIcon,
  BestForOilySkinIcon,
  BlushIcon,
  BronzerIcon,
  CheekStainIcon,
  ColorConcealerIcon,
  ColorCorrectorIcon,
  CompactIcon,
  CompactPowderIcon,
  ContourIcon,
  FixerIcon,
  FoundationIcon,
  HighCoverageFoundationIcon,
  HighlighterIcon,
  LiquidFoundationIcon,
  LiquidHighlighterIcon,
  LoosePowderIcon,
  MakeupRemoverIcon,
  MatteFoundationIcon,
  PrimerIcon,
  SettingSprayIcon,
  SindoorIcon,
  SPFFoundationIcon,
  StickFoundationIcon,
  WaterResistantFoundationIcon,
} from "../icons";

export const face_makeup = {
  id: 1,
  level: 2,
  label: "Face Makeup",
  category: "face_makeup",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Foundation",
      category: "foundation",
      icon: FoundationIcon,
      description:
        "Provides coverage for a flawless base with a natural, smooth finish.",
    },
    {
      id: 2,
      level: 3,
      label: "BB Cream",
      category: "bb_cream",
      icon: BBCreamIcon,
      description:
        "Lightweight formula that hydrates, evens skin tone, and protects skin.",
    },
    {
      id: 3,
      level: 3,
      label: "Compact Powder",
      category: "compact_powder",
      icon: CompactPowderIcon,
      description:
        "Sets makeup, reduces shine, and ensures a long-lasting matte finish.",
    },
    {
      id: 4,
      level: 3,
      label: "Loose Powder",
      category: "loose_powder",
      icon: LoosePowderIcon,
      description:
        "Finely milled powder for a smooth, shine-free finish that lasts all day.",
    },
    {
      id: 5,
      level: 3,
      label: "Banana Powder",
      category: "banana_powder",
      icon: BananaPowderIcon,
      description:
        "Brightens the complexion, reduces shine, and sets makeup beautifully.",
    },
    {
      id: 6,
      level: 3,
      label: "SPF Foundation",
      category: "spf_foundation",
      icon: SPFFoundationIcon,
      description:
        "Combines sun protection, coverage for a flawless, radiant look.",
    },
  ],
};

export const traditional_and_essentials = {
  id: 2,
  level: 2,
  label: "Traditional & Essentials",
  category: "traditional_and_essentials",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Sindoor",
      category: "sindoor",
      icon: SindoorIcon,
      description:
        "Symbolic powder for the hairline, enhancing traditional elegance.",
    },
  ],
};

export const cheeks_and_glow = {
  id: 3,
  level: 2,
  label: "Cheeks & Glow",
  category: "cheeks_and_glow",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Highlighter",
      category: "highlighter",
      icon: HighlighterIcon,
      description:
        "Adds a radiant, enhancing features with a luminous, dewy look.",
    },
    {
      id: 2,
      level: 3,
      label: "Liquid Highlighter",
      category: "liquid_highlighter",
      icon: LiquidHighlighterIcon,
      description:
        "Blendable liquid formula for a glowing, buildable, natural look.",
    },
    {
      id: 3,
      level: 3,
      label: "Blush",
      category: "blush",
      icon: BlushIcon,
      description:
        "Adds a pop of color to cheeks, creating a youthful, healthy look.",
    },
    {
      id: 4,
      level: 3,
      label: "Cheek Stain",
      category: "cheek_stain",
      icon: CheekStainIcon,
      description:
        "Long-lasting tint for a natural, flushed look that stays vibrant.",
    },
  ],
};

export const setting_and_finishing = {
  id: 4,
  level: 2,
  label: "Setting & Finishing",
  category: "setting_and_finishing",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Setting Spray",
      category: "setting_spray",
      icon: SettingSprayIcon,
      description:
        "Locks makeup for long wear, maintaining a fresh look without.",
    },
    {
      id: 2,
      level: 3,
      label: "Compact",
      category: "compact",
      icon: CompactIcon,
      description:
        "Portable powder for touch-ups, controls shine, sets makeup place.",
    },
    {
      id: 3,
      level: 3,
      label: "Fixer",
      category: "fixer",
      icon: FixerIcon,
      description:
        "Enhances makeup longevity, ensuring a smudge-proof, flawless.",
    },
  ],
};

export const foundations_by_finish = {
  id: 5,
  level: 2,
  label: "Foundations by Finish",
  category: "foundations_by_finish",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Liquid Foundation",
      category: "liquid_foundation",
      icon: LiquidFoundationIcon,
      description:
        "Buildable coverage with a natural finish that blends seamlessly skin.",
    },
    {
      id: 2,
      level: 3,
      label: "Matte Foundation",
      category: "matte_foundation",
      icon: MatteFoundationIcon,
      description:
        "Oil-absorbing formula for a shine-free, velvety matte look lasts.",
    },
    {
      id: 3,
      level: 3,
      label: "Water Resistant Foundation",
      category: "water_resistant_foundation",
      icon: WaterResistantFoundationIcon,
      description:
        "Long-wearing, water-resistant foundation that stays flawless day.",
    },
    {
      id: 4,
      level: 3,
      label: "High Coverage Foundation",
      category: "high_coverage_foundation",
      icon: HighCoverageFoundationIcon,
      description:
        "Conceals imperfections with full coverage, ensuring flawless look.",
    },
    {
      id: 5,
      level: 3,
      label: "Stick Foundation",
      category: "stick_foundation",
      icon: StickFoundationIcon,
      description:
        "Convenient stick format for easy application and buildable coverage.",
    },
  ],
};

export const foundations_by_skin_type = {
  id: 6,
  level: 2,
  label: "Foundations by Skin Type",
  category: "foundations_by_skin_type",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Best for Dry Skin",
      category: "best_for_dry_skin",
      icon: BestForDrySkinIcon,
      description:
        "Hydrating formula that nourishes and enhances radiance for dry skin.",
    },
    {
      id: 2,
      level: 3,
      label: "Best for Oily Skin",
      category: "best_for_oily_skin",
      icon: BestForOilySkinIcon,
      description:
        "Oil-controlling foundation that reduces shine, prevents breakouts.",
    },
  ],
};

export const primers_and_removers = {
  id: 7,
  level: 2,
  label: "Primers & Removers",
  category: "primers_and_removers",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Makeup Remover",
      category: "makeup_remover",
      icon: MakeupRemoverIcon,
      description:
        "Gently removes makeup while hydrating and refreshing the skin.",
    },
    {
      id: 2,
      level: 3,
      label: "Primer",
      category: "primer",
      icon: PrimerIcon,
      description:
        "Prepares skin, creating a smooth base for long-lasting makeup.",
    },
  ],
};

export const bronzers_and_contours = {
  id: 8,
  level: 2,
  label: "Bronzers & Contours",
  category: "bronzers_and_contours",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Bronzer",
      category: "bronzer",
      icon: BronzerIcon,
      description:
        "Adds warmth and a sun-kissed glow for a radiant complexion.",
    },
    {
      id: 2,
      level: 3,
      label: "Contour",
      category: "contour",
      icon: ContourIcon,
      description:
        "Defines features with shadows, enhancing structure and depth.",
    },
  ],
};

export const concealers_and_correctors = {
  id: 9,
  level: 2,
  label: "Concealers & Correctors",
  category: "concealers_and_correctors",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Color Concealer",
      category: "color_concealer",
      icon: ColorConcealerIcon,
      description:
        "It covers flaws with precision, delivering a flawless, airbrushed.",
    },
    {
      id: 2,
      level: 3,
      label: "Color Corrector",
      category: "color_corrector",
      icon: ColorCorrectorIcon,
      description:
        "Neutralizes discoloration, balancing skin tone for a radiant finish.",
    },
  ],
};
