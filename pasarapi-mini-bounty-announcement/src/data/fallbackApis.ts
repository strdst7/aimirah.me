export interface ApiEntry {
  id: string;
  title: string;
  category: string;
  group: string;
  country: string[];
  provider: string;
  tier: string;
  auth: string;
  pricing: string;
  docs: string;
}

/** Curated snapshot of pasarapi.xyz/api/catalogue — used only if the live fetch is blocked. */
export const FALLBACK_APIS: ApiEntry[] = [
  { id: 'fuelprice', title: 'Price of Petroleum & Diesel', category: 'Prices', group: 'Government & open data', country: ['MY'], provider: 'MOF', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/fuelprice' },
  { id: 'exchangerates_daily_1200', title: 'Daily Exchange Rates (1200)', category: 'Financial Markets', group: 'Government & open data', country: ['MY'], provider: 'BNM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/exchangerates_daily_1200' },
  { id: 'population_state', title: 'Population Table: States', category: 'Demography', group: 'Government & open data', country: ['MY'], provider: 'DOSM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/population_state' },
  { id: 'births', title: 'Daily Live Births', category: 'Demography', group: 'Government & open data', country: ['MY'], provider: 'JPN', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/births' },
  { id: 'hies_state', title: 'Household Income & Expenditure: States', category: 'Households', group: 'Government & open data', country: ['MY'], provider: 'DOSM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/hies_state' },
  { id: 'population_district', title: 'Population Table: Administrative Districts', category: 'Demography', group: 'Government & open data', country: ['MY'], provider: 'DOSM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/population_district' },
  { id: 'interestrates', title: 'Monthly Interest Rates', category: 'Financial Markets', group: 'Government & open data', country: ['MY'], provider: 'BNM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/interestrates' },
  { id: 'currency_in_circulation', title: 'Monthly Currency in Circulation', category: 'Financial Markets', group: 'Government & open data', country: ['MY'], provider: 'BNM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/currency_in_circulation' },
  { id: 'msic', title: 'MSIC Industry Codes', category: 'Data Dictionaries', group: 'Government & open data', country: ['MY'], provider: 'DOSM', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://data.gov.my/data-catalogue/msic' },
  { id: 'vn-vietqr-banks', title: 'VietQR Banks API — all VN banks with BIN codes', category: 'Banking & finance', group: 'Build', country: ['VN'], provider: 'Casso (VietQR.io)', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://www.vietqr.io/en' },
  { id: 'vn-vietqr-image', title: 'VietQR Quick Link — keyless bank-transfer QR images', category: 'Banking & finance', group: 'Build', country: ['VN'], provider: 'Casso (VietQR.io)', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://www.vietqr.io/en' },
  { id: 'vn-hanoi-air-quality', title: 'Hanoi Air Quality — live station JSON', category: 'Realtime', group: 'Government & open data', country: ['VN'], provider: 'moitruongthudo.vn', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://moitruongthudo.vn/' },
  { id: 'vn-provinces-open-api', title: 'Provinces Open API — VN administrative units', category: 'Data & enrichment', group: 'Build', country: ['VN'], provider: 'open-api.vn', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://provinces.open-api.vn/' },
  { id: 'vn-vps-stock-feed', title: 'VPS Stock Datafeed — live Vietnam quotes', category: 'Banking & finance', group: 'Build', country: ['VN'], provider: 'VPS Securities', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://github.com/thinh-vu/vnstock' },
  { id: 'tiki-open', title: 'Tiki Open Platform — marketplace seller API', category: 'E-commerce', group: 'Build', country: ['VN'], provider: 'Tiki', tier: 'commercial', auth: 'oauth', pricing: 'free', docs: 'https://open.tiki.vn/docs/docs/current/getting-started/' },
  { id: 'vn-public-holidays-nager', title: 'Vietnam Public Holidays — Tết as JSON', category: 'Data & enrichment', group: 'Build', country: ['VN'], provider: 'Nager.Date', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://date.nager.at/Api' },
  { id: 'vn-odm-vietnam-ckan', title: 'Open Development Vietnam — 13,500+ CKAN datasets', category: 'Other portals', group: 'Government & open data', country: ['VN'], provider: 'Open Development Mekong', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://vietnam.opendevelopmentmekong.net/' },
  { id: 'vn-vietcombank-fx', title: 'Vietcombank Exchange Rates — daily VND feed', category: 'Banking & finance', group: 'Build', country: ['VN'], provider: 'Vietcombank', tier: 'open', auth: 'none', pricing: 'free', docs: 'https://www.vietcombank.com.vn/' },
];
