import { LevelOneCategoryType } from "../types";
import About from "../components/about/About";
import Collections from "../components/collections/Collections";
import Eyes from "../components/eyes/Eyes";
import Face from "../components/face/Face";
import ForYou from "../components/for-you/ForYou";
import Lips from "../components/lips/Lips";
import Skin from "../components/skin/Skin";
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
  legal,
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
  subCategories: [company, careers, press, trust_center, legal],
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
