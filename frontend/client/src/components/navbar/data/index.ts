import { Category } from "../../../types";

export const navbarCategoryData: Category[] = [
  // New
  {
    id: 1,
    category: "new",
    label: "New",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "",
        label: "",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
  // Lipsticks
  {
    id: 2,
    category: "lips",
    label: "Lips",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "lipsticks",
        label: "Lipsticks",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "transfer_proof_lipsticks",
            label: "Transfer Proof Lipsticks",
            level: 3,
          },
          {
            id: 2,
            category: "matte_lipsticks",
            label: "Matte Lipsticks",
            level: 3,
          },
          {
            id: 3,
            category: "liquid_lipsticks",
            label: "Liquid Lipsticks",
            level: 3,
          },
          {
            id: 4,
            category: "powder_lipsticks",
            label: "Powder Lipsticks",
            level: 3,
          },
          {
            id: 5,
            category: "crayon_lipsticks",
            label: "Crayon Lipsticks",
            level: 3,
          },
          {
            id: 6,
            category: "satin_lipsticks",
            label: "Satin Lipsticks",
            level: 3,
          },
          {
            id: 7,
            category: "bullet_lipsticks",
            label: "Bullet Lipsticks",
            level: 3,
          },
          {
            id: 8,
            category: "lip_gloss_and_liners",
            label: "Lip Gloss & Liners",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "lip_care",
        label: "Lip Care",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "lip_primers_and_scrubs",
            label: "Lip Primers & Scrubs",
            level: 3,
          },
          {
            id: 2,
            category: "lipstick_fixers_and_removers",
            label: "Lipstick Fixers & Removers",
            level: 3,
          },
          {
            id: 3,
            category: "lip_balms",
            label: "Lip Balms",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "lipstick_sets_and_combos",
        label: "Lipstick Sets & Combos",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "lipstick_sets",
            label: "Lipstick Sets",
            level: 3,
          },
          {
            id: 2,
            category: "lipstick_combos",
            label: "Lipstick Combos",
            level: 3,
          },
        ],
      },
    ],
  },
  // Eyes
  {
    id: 3,
    category: "eyes",
    label: "Eyes",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "kohl_and_kajal",
        label: "Kohl & Kajal",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "kohls",
            label: "Kohls",
            level: 3,
          },
          {
            id: 2,
            category: "kajal",
            label: "Kajal",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "mascara",
        label: "Mascara",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "volumizing_mascara",
            label: "Volumizing Mascara",
            level: 3,
          },
          {
            id: 2,
            category: "curl_lengthening_mascara",
            label: "Curl Lengthening Mascara",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "eyeliner",
        label: "Eyeliner",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "liquid_eyeliners",
            label: "Liquid Eyeliners",
            level: 3,
          },
          {
            id: 2,
            category: "gel_eyeliners",
            label: "Gel Eyeliners",
            level: 3,
          },
          {
            id: 3,
            category: "pen_eyeliners",
            label: "Pen Eyeliners",
            level: 3,
          },
          {
            id: 4,
            category: "magnetic_eyelashes",
            label: "Magnetic Eyelashes",
            level: 3,
          },
        ],
      },
      {
        id: 4,
        category: "eyeshadows",
        label: "Eyeshadows",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "eyeshadow_palettes",
            label: "Eyeshadow Palettes",
            level: 3,
          },
          {
            id: 2,
            category: "liquid_eyeshadows",
            label: "Liquid Eyeshadows",
            level: 3,
          },
        ],
      },
      {
        id: 5,
        category: "eyebrow",
        label: "Eyebrow",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "brow_definer",
            label: "Brow Definer",
            level: 3,
          },
          {
            id: 2,
            category: "brow_pencil",
            label: "Brow Pencil",
            level: 3,
          },
        ],
      },
      {
        id: 6,
        category: "eye_value_sets",
        label: "Eye Value Sets",
        level: 2,
        subcategories: [],
      },
    ],
  },
  // Face
  {
    id: 4,
    category: "face",
    label: "Face",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "foundation_and_bb_cream",
        label: "Foundation and BB Cream",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "stick_foundation",
            label: "Stick Foundation",
            level: 3,
          },
          {
            id: 2,
            category: "liquid_foundation",
            label: "Liquid Foundation",
            level: 3,
          },
          {
            id: 3,
            category: "bb_cream",
            label: "BB Cream",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "compact_and_fixers",
        label: "Compact and Fixers",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "setting_sprays",
            label: "Setting Sprays",
            level: 3,
          },
          {
            id: 2,
            category: "loose_powder",
            label: "Loose Powder",
            level: 3,
          },
          {
            id: 3,
            category: "compact",
            label: "Compact",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "blush",
        label: "Blush",
        level: 2,
        subcategories: [],
      },
      {
        id: 4,
        category: "palettes",
        label: "Palettes",
        level: 2,
        subcategories: [],
      },
      {
        id: 5,
        category: "concealers_and_correctors",
        label: " Concealers and Correctors",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "color_correctors",
            label: "Color Correctors",
            level: 3,
          },
        ],
      },
      {
        id: 6,
        category: "bronzer_and_contour",
        label: "Bronzer & Contour",
        level: 2,
        subcategories: [],
      },
      {
        id: 7,
        category: "primer",
        label: "Primer",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "translucent_primers",
            label: "Translucent Primers",
            level: 3,
          },
        ],
      },
      {
        id: 8,
        category: "highlighters",
        label: "Highlighters",
        level: 2,
        subcategories: [],
      },
    ],
  },
  // Nails
  {
    id: 5,
    category: "nails",
    label: "Nails",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "",
        label: "",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
  // Skin
  {
    id: 6,
    category: "skin",
    label: "Skin",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "moisturizers_and_sunscreens",
        label: "Moisturizers & Sunscreens",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "moisturizers",
            label: "Moisturizers",
            level: 3,
          },
          {
            id: 2,
            category: "sunscreens",
            label: "Sunscreens",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "mists_and_hydrating_sticks",
        label: "Mists & Hydrating Sticks",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "face_mists",
            label: "Face Mists",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "skincare_ranges",
        label: "Skincare Ranges",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "aquaholic",
            label: "Aquaholic",
            level: 3,
          },
          {
            id: 2,
            category: "coffee_culture",
            label: "Coffee Culture",
            level: 3,
          },
          {
            id: 3,
            category: "citrus_got_real",
            label: "Citrus Got Real",
            level: 3,
          },
        ],
      },
      {
        id: 4,
        category: "mask_and_serum",
        label: "Mask & Serum",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "serum",
            label: "Serum",
            level: 3,
          },
        ],
      },
      {
        id: 5,
        category: "lip_and_eye_care",
        label: "Lip & Eye Care",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 6,
        category: "cleansers_and_exfoliators",
        label: "Cleansers & Exfoliators",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "cleansers",
            label: "Cleansers",
            level: 3,
          },
          {
            id: 2,
            category: "exfoliators",
            label: "Exfoliators",
            level: 3,
          },
        ],
      },
    ],
  },
  // Offers
  {
    id: 7,
    category: "offers",
    label: "Offers",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "",
        label: "",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
  // Gifting
  {
    id: 8,
    category: "gifting",
    label: "Gifting",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "lipstick_sets",
        label: "Lipstick Sets",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "sugar_merch",
        label: "Sugar Merch",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "value_sets",
        label: "Value Sets",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 4,
        category: "makeup_kits",
        label: "Makeup Kits",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 5,
        category: "corporate_gifting",
        label: "Corporate Gifting",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 6,
        category: "sugar_sets",
        label: "Sugar Sets",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
  // Sugar Pop
  {
    id: 9,
    category: "sugar_pop",
    label: "Sugar Pop",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "lips",
        label: "Lips",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 2,
        category: "eyes",
        label: "Eyes",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 3,
        category: "face",
        label: "Face",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 4,
        category: "nails",
        label: "Nails",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 5,
        category: "skincare",
        label: "Skincare",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 6,
        category: "body_care",
        label: "Body Care",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 7,
        category: "best_of_sugar_pop",
        label: "Best of Sugar Pop",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
      {
        id: 8,
        category: "view_all",
        label: "View All",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
  // Sugar Play
  {
    id: 10,
    category: "sugar_play",
    label: "Sugar Play",
    level: 1,
    subcategories: [
      {
        id: 1,
        category: "",
        label: "",
        level: 2,
        subcategories: [
          {
            id: 1,
            category: "",
            label: "",
            level: 3,
          },
        ],
      },
    ],
  },
];
