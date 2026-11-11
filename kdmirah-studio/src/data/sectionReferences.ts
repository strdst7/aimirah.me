// Reference metadata only. Do not import images, copy, or source code from Oversight Supply.
export type SectionReference = {
  slug: string;
  title: string;
  category: string;
};

const references: Array<[string, string]> = [
  ["portfolio-pavement", "Pavement"],
  ["portfolio-volumes", "Volumes"],
  ["portfolio-vortex", "Vortex"],
  ["portfolio-vessel", "Vessel"],
  ["portfolio-corridor", "Corridor"],
  ["portfolio-jewelcase", "Jewelcase"],
  ["portfolio-panes", "Panes"],
  ["prompt-meadow", "Meadow"],
  ["prompt-bloom", "Bloom"],
  ["portfolio-collage", "Collage"],
  ["signal", "Signal & Soil"],
  ["orbit", "Orbit"],
  ["condensation", "Condensation"],
  ["transmission", "Transmission"],
  ["florilegium", "Florilegium"],
  ["joiner", "Joiner"],
  ["prompt-darkroom", "Darkroom"],
  ["404-planet", "404 Planet"],
  ["prompt-tide", "Tide"],
  ["portfolio-desktop", "Desktop"],
  ["prompt-kernel", "Kernel"],
  ["prompt-petal", "Petal"],
  ["portfolio-vinyl", "Vinyl"],
  ["cyanotype", "Cyanotype"],
  ["prompt-parlor", "Parlor"],
  ["pricing-circuit", "Circuit"],
  ["rootsong", "Rootsong"],
  ["prompt-horizon", "Horizon"],
  ["herbarium", "Herbarium"],
  ["evergrid-home-product-showcase-01", "Home — Product Showcase 01"],
  ["pricing-studio", "Studio"],
  ["pricing-choice", "Choice"],
  ["prompt-murmur", "Murmur"],
  ["evergrid-product-integrations-01", "Product — Integrations 01"],
  ["portfolio-folio", "Folio"],
  ["pricing-license", "License"],
  ["phototropism", "Phototropism"],
  ["evergrid-home-hero-01", "Home — Hero 01"],
  ["pigment", "Pigment"],
  ["fold", "Fold"],
  ["evergrid-pricing-pricing-01", "Pricing — Pricing 01"],
  ["evergrid-home-features-01", "Home — Features 01"],
  ["evergrid-home-features-02", "Home — Features 02"],
  ["evergrid-about-us-team-01", "About Us — Team 01"],
  ["evergrid-case-studies-use-cases-01", "Case Studies — Use Cases 01"],
  ["evergrid-blog-blog-01", "Blog — Blog 01"],
  ["evergrid-home-use-cases-01", "Home — Use Cases 01"],
  ["portfolio-plan", "Plan"],
  ["evergrid-contact-contact-01", "Contact — Contact 01"],
  ["evergrid-blog-hero-01", "Blog — Hero 01"],
  ["evergrid-home-footer-01", "Home — Footer 01"],
  ["evergrid-about-us-other-01", "About Us — Other 01"],
  ["evergrid-product-hero-01", "Product — Hero 01"],
  ["404-halo", "404 Halo"],
  ["404-receipt", "404 Receipt"],
  ["evergrid-home-cta-01", "Home — CTA 01"],
  ["pricing-strata", "Strata"],
  ["404-breakout", "404 Breakout"],
  ["404-scribble", "404 Scribble"],
  ["evergrid-about-us-features-01", "About Us — Features 01"],
  ["404-mosaic", "404 Mosaic"],
  ["evergrid-about-us-features-02", "About Us — Features 02"],
  ["evergrid-product-how-it-works-01", "Product — How It Works 01"],
  ["prompt-atlas", "Atlas"],
  ["pricing-fit", "Fit"],
  ["pricing-meter", "Meter"],
  ["evergrid-home-navigation-01", "Home — Navigation 01"],
  ["evergrid-product-features-01", "Product — Features 01"],
  ["404-crt", "404 CRT"],
  ["evergrid-home-faq-01", "Home — FAQ 01"],
];

function categoryFor(slug: string): string {
  if (slug.startsWith("portfolio-")) return "Portfolio";
  if (slug.startsWith("prompt-")) return "Prompt tools";
  if (slug.startsWith("pricing-") || slug.startsWith("evergrid-pricing-")) return "Pricing";
  if (slug.startsWith("404-")) return "404 pages";
  if (slug.startsWith("evergrid-")) return "Page sections";
  return "Experiments";
}

export const sectionReferences: SectionReference[] = references.map(([slug, title]) => ({
  slug,
  title,
  category: categoryFor(slug),
}));
