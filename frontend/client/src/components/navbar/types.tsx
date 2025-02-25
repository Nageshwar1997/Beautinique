import { FC } from "react";
import { SVGType } from "../../types";

export interface SocialCommunityItem {
  id: number;
  icon: SVGType;
  label: string;
  link: string;
}

export interface LevelOneCategoryType {
  id: number;
  level: number;
  label: string;
  category: string;
  component: FC;
  subCategories: LevelTwoCategoryType[];
}

export interface LevelTwoCategoryType {
  id: number;
  level: number;
  label: string;
  category: string;
  subCategories: LevelThreeCategoryType[];
  heading?: string;
  videoUrl?: string;
  thumbnail?: string;
  description?: string;
}

export interface LevelThreeCategoryType {
  id: number;
  level: number;
  label: string;
  category: string;
  icon: SVGType;
  description: string;
}

export interface Testimonial {
  id: number;
  content: string;
  name: string;
  role: string;
  image: string;
}
