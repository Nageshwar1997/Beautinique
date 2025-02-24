import { LevelOneCategoryType } from "../types";
import About from "../components/about/About";
import Collections from "../components/collections/Collections";
import Eyes from "../components/eyes/Eyes";
import Face from "../components/face/Face";
import ForYou from "../components/for-you/ForYou";
import Lips from "../components/lips/Lips";
import Skin from "../components/skin/Skin";
import { TextItem } from "../../../types";
import {
  bronzers_and_contours,
  cheeks_and_glow,
  concealers_and_correctors,
  face_makeup,
  foundations_by_finish,
  foundations_by_skin_type,
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
  finish_types,
  lip_care,
  lip_enhancers_and_other,
  lipstick_forms,
  lipstick_sets_and_combos,
  long_lasting_lipsticks,
} from "../components/lips/data";
import { blogs, new_new, offers, sugar_play } from "../components/for-you/data";
import {
  moisturizers,
  cleansing_and_exfoliation,
  natures_blend,
  face_mask,
} from "../components/skin/data";
import {
  bath_and_body,
  gifting,
  hair_care,
  sugar_pop,
} from "../components/collections/data";
import {
  careers,
  company,
  press,
  trust_center,
} from "../components/about/data";

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
  subCategories: [
    finish_types,
    lipstick_forms,
    long_lasting_lipsticks,
    lip_care,
    lip_enhancers_and_other,
    lipstick_sets_and_combos,
  ],
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
    bronzers_and_contours,
    concealers_and_correctors,
    foundations_by_skin_type,
    foundations_by_finish,
  ],
};

export const skin: LevelOneCategoryType = {
  id: 5,
  level: 1,
  label: "Skin",
  category: "skin",
  component: Skin,
  subCategories: [
    moisturizers,
    cleansing_and_exfoliation,
    natures_blend,
    face_mask,
  ],
};

export const collections: LevelOneCategoryType = {
  id: 6,
  level: 1,
  label: "Collections",
  category: "collections",
  component: Collections,
  subCategories: [bath_and_body, sugar_pop, hair_care, gifting],
};

export const about: LevelOneCategoryType = {
  id: 7,
  level: 1,
  label: "About",
  category: "about",
  component: About,
  subCategories: [company, careers, press, trust_center],
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

export const dummyFeedbacks: TextItem[][] = [
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
    { text: "go-to face", isHighlighted: true },
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
