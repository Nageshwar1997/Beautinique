import {
  AboutUsIcon,
  AwardsIcon,
  ComplianceIcon,
  ContactUsIcon,
  MissionVisionValuesIcon,
  NewsRoomIcon,
  OpeningsIcon,
  PrivacyPolicyIcon,
  RetailECommerceIcon,
  TeamIcon,
  TermsAndConditionsIcon,
  ValuesAndCultureIcon,
} from "../icons";

export const company = {
  id: 1,
  level: 2,
  heading: "",
  label: "Company",
  category: "company",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "About Us",
      category: "about_us",
      icon: AboutUsIcon,
    },
    {
      id: 2,
      level: 3,
      label: "Mission Vision Values",
      category: "mission_vision_values",
      icon: MissionVisionValuesIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Team",
      category: "team",
      icon: TeamIcon,
    },
    {
      id: 4,
      level: 3,
      label: "Contact Us",
      category: "contact_us",
      icon: ContactUsIcon,
    },
  ],
};

export const press = {
  id: 1,
  level: 2,
  heading: "",
  label: "Press",
  category: "press",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Newsroom",
      category: "newsroom",
      icon: NewsRoomIcon,
    },
    {
      id: 2,
      level: 3,
      label: "Awards",
      category: "awards",
      icon: AwardsIcon,
    },
  ],
};

export const careers = {
  id: 1,
  level: 2,
  heading: "",
  label: "Careers",
  category: "careers",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Values/Culture",
      category: "values_culture",
      icon: ValuesAndCultureIcon,
    },
    {
      id: 2,
      level: 3,
      label: "Openings",
      category: "openings",
      icon: OpeningsIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Retail/E-Commerce",
      category: "retail_e_commerce",
      icon: RetailECommerceIcon,
    },
  ],
};

export const trust_center = {
  id: 1,
  level: 2,
  heading: "",
  label: "Trust Center & Legal",
  category: "trust_center_and_legal",
  subCategories: [
    {
      id: 1,
      level: 3,
      label: "Compliance",
      category: "compliance",
      icon: ComplianceIcon,
    },
    {
      id: 2,
      level: 3,
      label: "Privacy/Policy",
      category: "privacy_policy",
      icon: PrivacyPolicyIcon,
    },
    {
      id: 3,
      level: 3,
      label: "Terms & Conditions",
      category: "terms_and_conditions",
      icon: TermsAndConditionsIcon,
    },
  ],
};

export const testimonials = [
  {
    id: 1,
    content:
      "I absolutely love the range of products on this website! The quality is unmatched, and my skin has never felt better. I always get compliments!",
    name: "Nageshwar Pawar",
    role: "Founder",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/krishna-gupta.webp",
  },
  {
    id: 2,
    content: `Finding the perfect shade was so easy. The product descriptions and customer reviews helped me make the right choice. Fast delivery too!`,
    name: "Manjusha Magar",
    role: "CEO",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/aarav-joshi.webp",
  },
  {
    id: 3,
    content: `I love how the products feel on my skin. They are lightweight, long-lasting, and make me feel confident all day. Highly recommended!`,
    name: "Sanket Pawar",
    role: "Manager",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/lucas-smith.webp",
  },
];
