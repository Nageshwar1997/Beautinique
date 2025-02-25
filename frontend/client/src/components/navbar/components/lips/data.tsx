import {
  TransferLipstickIcon,
  MatteLipstickIcon,
  LiquidLipstickIcon,
  PowderLipstickIcon,
  CrayonLipstickIcon,
  SatinLipstickIcon,
  BulletLipstickIcon,
  LipGlossIcon,
  HiShineLipstickIcon,
  LipLinerIcon,
  LipGlitterIcon,
  LipTintAndSatinIcon,
  AllIcon,
  LipPrimerIcon,
  LipstickRemoverIcon,
  LipBalmIcon,
  TintedLipBalmIcon,
  LipstickSetIcon,
  LipstickComboIcon,
  LipPaletteIcon,
  WaterproofLipstickIcon,
  SmudgeProofLipstickIcon,
} from "../icons";

export const finish_types = {
  id: 1,
  level: 2,
  label: "Finish Types",
  category: "finish_types",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Matte Lipstick",
      category: "matte_lipstick",
      icon: MatteLipstickIcon,
      description:
        "Velvety matte finish with long-lasting, intense color payoff everywhere.",
    },
    {
      id: 2,
      level: 3,
      label: "Satin Lipstick",
      category: "satin_lipstick",
      icon: SatinLipstickIcon,
      description:
        "Smooth, creamy texture with a luminous, semi-matte finish always.",
    },
    {
      id: 3,
      level: 3,
      label: "Hi-Shine Lipstick",
      category: "hi_shine_lipstick",
      icon: HiShineLipstickIcon,
      description:
        "Glossy finish for a shiny, luscious look with rich pigment beautifully.",
    },
    {
      id: 4,
      level: 3,
      label: "Lip Gloss",
      category: "lip_gloss",
      icon: LipGlossIcon,
      description:
        "Sheer to medium coverage with a high-shine, glossy finish flawlessly.",
    },
  ],
};

export const lipstick_forms = {
  id: 2,
  level: 2,
  label: "Lipstick Forms",
  category: "lipstick_forms",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Liquid Lipstick",
      category: "liquid_lipstick",
      icon: LiquidLipstickIcon,
      description:
        "Rich, long-lasting color with a lightweight, matte finish beautifully.",
    },
    {
      id: 2,
      level: 3,
      label: "Powder Lipstick",
      category: "powder_lipstick",
      icon: PowderLipstickIcon,
      description:
        "Weightless powder formula with a soft-focus, matte effect perfectly.",
    },
    {
      id: 3,
      level: 3,
      label: "Crayon Lipstick",
      category: "crayon_lipstick",
      icon: CrayonLipstickIcon,
      description:
        "Easy-to-apply crayon for precise lines and bold color payoff smoothly.",
    },
    {
      id: 4,
      level: 3,
      label: "Bullet Lipstick",
      category: "bullet_lipstick",
      icon: BulletLipstickIcon,
      description:
        "Classic bullet shape with smooth, creamy, full-coverage color always.",
    },
  ],
};

export const long_lasting_lipsticks = {
  id: 3,
  level: 2,
  label: "Long-Lasting Lipsticks",
  category: "long_lasting_lipsticks",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Transfer Proof Lipstick",
      category: "transfer_proof_lipstick",
      icon: TransferLipstickIcon,
      description:
        "Stays put all day without smudging or fading for long-lasting wear.",
    },
    {
      id: 2,
      level: 3,
      label: "Water Proof Lipstick",
      category: "water_proof_lipstick",
      icon: WaterproofLipstickIcon,
      description:
        "Resistant to water and sweat, ensuring color stays vibrant always.",
    },
    {
      id: 3,
      level: 3,
      label: "Lip Tint & Stain",
      category: "lip_tint_and_stain",
      icon: LipTintAndSatinIcon,
      description:
        "Lightweight tint with a natural finish that lasts for hours smoothly.",
    },
    {
      id: 4,
      level: 3,
      label: "Smudge Proof",
      category: "smudge_proof_lipstick",
      icon: SmudgeProofLipstickIcon,
      description:
        "No smudging or transferring, providing a flawless look perfectly.",
    },
  ],
};

export const lip_care = {
  id: 4,
  level: 2,
  label: "Lip Care",
  category: "lip_care",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Lip Primer & Scrub",
      category: "lip_primer_and_scrub",
      icon: LipPrimerIcon,
      description:
        "Preps lips for smooth application and enhances color beautifully.",
    },
    {
      id: 2,
      level: 3,
      label: "Lipstick Fixer & Remover",
      category: "lipstick_fixer_and_remover",
      icon: LipstickRemoverIcon,
      description:
        "Ensures long wear and easy removal without residue effortlessly.",
    },
    {
      id: 3,
      level: 3,
      label: "Lip Balm",
      category: "lip_balm",
      icon: LipBalmIcon,
      description:
        "Deeply hydrates and protects lips from dryness and cracking.",
    },
    {
      id: 4,
      level: 3,
      label: "Tinted Lip Balm",
      category: "tinted_lip_balm",
      icon: TintedLipBalmIcon,
      description:
        "Hydration with a hint of color for a natural, radiant look daily.",
    },
  ],
};

export const lip_enhancers_and_other = {
  id: 5,
  level: 2,
  label: "Lip Enhancers & Other",
  category: "lip_enhancers_and_other",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Lip Liner",
      category: "lip_liner",
      icon: LipLinerIcon,
      description:
        "Defines lips with precision, shaping and preventing feathering daily.",
    },
    {
      id: 2,
      level: 3,
      label: "Lip Glitter",
      category: "lip_glitter",
      icon: LipGlitterIcon,
      description:
        "Adds sparkle and shine for a glamorous, bold look on special occasions.",
    },
    {
      id: 3,
      level: 3,
      label: "View All",
      category: "view_all",
      icon: AllIcon,
      description:
        "Explore the complete range of lip products for every need beautifully.",
    },
  ],
};

export const lipstick_sets_and_combos = {
  id: 6,
  level: 2,
  label: "Lipstick Set & Combo",
  category: "lipstick_set_and_combo",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Lipstick Set",
      category: "lipstick_set",
      icon: LipstickSetIcon,
      description:
        "Multiple shades in one set for versatile, everyday looks beautifully.",
    },
    {
      id: 2,
      level: 3,
      label: "Lipstick Combo",
      category: "lipstick_combo",
      icon: LipstickComboIcon,
      description:
        "Perfectly paired lip products for a complete, cohesive look always.",
    },
    {
      id: 3,
      level: 3,
      label: "Lip Palette",
      category: "lip_palette",
      icon: LipPaletteIcon,
      description:
        "Versatile palette with various shades for creative, bold looks daily.",
    },
  ],
};
