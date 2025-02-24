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
    },
    {
      id: 2,
      level: 3,
      label: "Satin Lipstick",
      category: "satin_lipstick",
      icon: SatinLipstickIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Hi-Shine Lipstick",
      category: "hi_shine_lipstick",
      icon: HiShineLipstickIcon,
    },
    {
      id: 4,
      level: 3,
      label: "Lip Gloss",
      category: "lip_gloss",
      icon: LipGlossIcon,
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
    },
    {
      id: 2,
      level: 3,
      label: "Powder Lipstick",
      category: "powder_lipstick",
      icon: PowderLipstickIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Crayon Lipstick",
      category: "crayon_lipstick",
      icon: CrayonLipstickIcon,
    },
    {
      id: 4,
      level: 3,
      label: "Bullet Lipstick",
      category: "bullet_lipstick",
      icon: BulletLipstickIcon,
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
    },
    {
      id: 2,
      level: 3,
      label: "Water Proof Lipstick",
      category: "water_proof_lipstick",
      icon: TransferLipstickIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Lip Tint & Stain",
      category: "lip_tint_and_stain",
      icon: LipTintAndSatinIcon,
    },
    {
      id: 4,
      level: 3,
      label: "Smudge Proof",
      category: "smudge_proof_lipstick",
      icon: TransferLipstickIcon,
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
      description: "Preps lips for smooth application.",
    },
    {
      id: 2,
      level: 3,
      label: "Lipstick Fixer & Remover",
      category: "lipstick_fixer_and_remover",
      icon: LipstickRemoverIcon,
      description: "Ensures long wear and easy removal.",
    },
    {
      id: 3,
      level: 3,
      label: "Lip Balm",
      category: "lip_balm",
      icon: LipBalmIcon,
      description: "Moisturizes and nourishes dry lips.",
    },
    {
      id: 4,
      level: 3,
      label: "Tinted Lip Balm",
      category: "tinted_lip_balm",
      icon: TintedLipBalmIcon,
      description: "Hydration with a hint of color.",
    },
  ],
};

export const lip_enhancers_and_others = {
  id: 5,
  level: 2,
  label: "Lip Enhancers & Others",
  category: "lip_enhancers_and_others",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Lip Liner",
      category: "lip_liner",
      icon: LipLinerIcon,
    },
    {
      id: 2,
      level: 3,
      label: "Lip Glitter",
      category: "lip_glitter",
      icon: LipGlitterIcon,
    },
    {
      id: 3,
      level: 3,
      label: "View All",
      category: "view_all",
      icon: AllIcon,
    },
  ],
};

export const lipstick_set_and_combo = {
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
      description: "Multiple shades in one set.",
    },
    {
      id: 2,
      level: 3,
      label: "Lipstick Combo",
      category: "lipstick_combo",
      icon: LipstickComboIcon,
      description: "Perfectly paired lip products.",
    },
    {
      id: 3,
      level: 3,
      label: "Lip Palette",
      category: "lip_palette",
      icon: LipPaletteIcon,
      description: "Versatile palette with various shades.",
    },
  ],
};
