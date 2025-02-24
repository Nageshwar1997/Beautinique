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
