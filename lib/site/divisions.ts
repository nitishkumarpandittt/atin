// Sister companies in the same group. Each runs its own website; the cards on /divisions link out to them.
// Descriptions are factual (what each company does and offers), taken from the companies' own sites.
export type Division = {
  name: string;
  url: string;
  /** Shown under the name; the bare host of `url`. */
  domain: string;
  location: string;
  description: string;
  logo: string;
  logoAlt: string;
};

export const divisions: Division[] = [
  {
    name: "Chemross Lifesciences Pvt. Ltd.",
    url: "https://chemrosslifesciences.com",
    domain: "chemrosslifesciences.com",
    location: "Chandigarh",
    description: "Pharmaceutical franchise and third-party manufacturing company with a DCGI-approved portfolio of tablets, capsules, syrups, injectables and herbal preparations.",
    logo: "/divisions/chemross.webp",
    logoAlt: "Chemross Lifesciences logo",
  },
  {
    name: "Celestica Laboratories",
    url: "https://celesticalab.com",
    domain: "celesticalab.com",
    location: "Chandigarh · Navi Mumbai · Dubai",
    description: "PCD pharma franchise company covering allopathic, ayurvedic and herbal formulations: tablets, capsules, syrups, injectables, creams and other topicals.",
    logo: "/divisions/celestica.webp",
    logoAlt: "Celestica Laboratories logo",
  },
  {
    name: "Ainsley Lifesciences Pvt. Ltd.",
    url: "https://www.ainsleylifesciences.com",
    domain: "ainsleylifesciences.com",
    location: "Chandigarh",
    description: "Allopathic formulations across tablets, capsules, syrups, dry syrups, injectables, sachets, drops and derma products, supplied through PCD franchise and third-party manufacturing in India and abroad.",
    logo: "/divisions/ainsley.webp",
    logoAlt: "Ainsley Lifesciences logo",
  },
];
