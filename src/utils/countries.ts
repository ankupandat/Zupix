// Global Country, Dial Code & Regional Locations Engine for Zupix

export interface LocationItem {
  name: string;
  state?: string;
  pincode: string;
  postalCode: string;
}

export interface CountryOption {
  code: string; // ISO 2-letter
  name: string;
  dialCode: string;
  defaultPincode: string;
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  popularLocations: LocationItem[];
  popularCities: LocationItem[];
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    defaultPincode: '110001',
    postalCodeLabel: 'Pincode',
    postalCodePlaceholder: 'e.g. 110001',
    popularLocations: [
      { name: 'Delhi NCR', state: 'Delhi', pincode: '110001', postalCode: '110001' },
      { name: 'Gurugram', state: 'Haryana', pincode: '122002', postalCode: '122002' },
      { name: 'Noida', state: 'Uttar Pradesh', pincode: '201301', postalCode: '201301' },
      { name: 'Mumbai', state: 'Maharashtra', pincode: '400001', postalCode: '400001' },
      { name: 'Bengaluru', state: 'Karnataka', pincode: '560001', postalCode: '560001' },
      { name: 'Hyderabad', state: 'Telangana', pincode: '500001', postalCode: '500001' },
      { name: 'Chandigarh', state: 'Chandigarh', pincode: '160017', postalCode: '160017' },
      { name: 'Pune', state: 'Maharashtra', pincode: '411001', postalCode: '411001' },
      { name: 'Kolkata', state: 'West Bengal', pincode: '700001', postalCode: '700001' },
      { name: 'Chennai', state: 'Tamil Nadu', pincode: '600001', postalCode: '600001' },
      { name: 'Jaipur', state: 'Rajasthan', pincode: '302001', postalCode: '302001' },
      { name: 'Ahmedabad', state: 'Gujarat', pincode: '380001', postalCode: '380001' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    defaultPincode: '10001',
    postalCodeLabel: 'ZIP Code',
    postalCodePlaceholder: 'e.g. 10001',
    popularLocations: [
      { name: 'New York', state: 'NY', pincode: '10001', postalCode: '10001' },
      { name: 'Los Angeles', state: 'CA', pincode: '90001', postalCode: '90001' },
      { name: 'Chicago', state: 'IL', pincode: '60601', postalCode: '60601' },
      { name: 'Houston', state: 'TX', pincode: '77001', postalCode: '77001' },
      { name: 'San Francisco', state: 'CA', pincode: '94102', postalCode: '94102' },
      { name: 'Seattle', state: 'WA', pincode: '98101', postalCode: '98101' },
      { name: 'Austin', state: 'TX', pincode: '73301', postalCode: '73301' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    defaultPincode: 'EC1A 1BB',
    postalCodeLabel: 'Postcode',
    postalCodePlaceholder: 'e.g. SW1A 1AA',
    popularLocations: [
      { name: 'London', state: 'Greater London', pincode: 'EC1A 1BB', postalCode: 'EC1A 1BB' },
      { name: 'Manchester', state: 'Greater Manchester', pincode: 'M1 1AE', postalCode: 'M1 1AE' },
      { name: 'Birmingham', state: 'West Midlands', pincode: 'B1 1AA', postalCode: 'B1 1AA' },
      { name: 'Edinburgh', state: 'Scotland', pincode: 'EH1 1YZ', postalCode: 'EH1 1YZ' },
      { name: 'Glasgow', state: 'Scotland', pincode: 'G1 1XQ', postalCode: 'G1 1XQ' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    defaultPincode: '00000',
    postalCodeLabel: 'Area / Makani No.',
    postalCodePlaceholder: 'e.g. Downtown Dubai',
    popularLocations: [
      { name: 'Dubai', state: 'Dubai', pincode: '337-1500', postalCode: '337-1500' },
      { name: 'Abu Dhabi', state: 'Abu Dhabi', pincode: '00000', postalCode: '00000' },
      { name: 'Sharjah', state: 'Sharjah', pincode: '00000', postalCode: '00000' },
      { name: 'Ajman', state: 'Ajman', pincode: '00000', postalCode: '00000' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    defaultPincode: 'M5V 2T6',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. M5V 2T6',
    popularLocations: [
      { name: 'Toronto', state: 'ON', pincode: 'M5V 2T6', postalCode: 'M5V 2T6' },
      { name: 'Vancouver', state: 'BC', pincode: 'V6B 1A1', postalCode: 'V6B 1A1' },
      { name: 'Montreal', state: 'QC', pincode: 'H3A 1A1', postalCode: 'H3A 1A1' },
      { name: 'Calgary', state: 'AB', pincode: 'T2P 1J9', postalCode: 'T2P 1J9' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    defaultPincode: '2000',
    postalCodeLabel: 'Postcode',
    postalCodePlaceholder: 'e.g. 2000',
    popularLocations: [
      { name: 'Sydney', state: 'NSW', pincode: '2000', postalCode: '2000' },
      { name: 'Melbourne', state: 'VIC', pincode: '3000', postalCode: '3000' },
      { name: 'Brisbane', state: 'QLD', pincode: '4000', postalCode: '4000' },
      { name: 'Perth', state: 'WA', pincode: '6000', postalCode: '6000' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    defaultPincode: '018989',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. 018989',
    popularLocations: [
      { name: 'Central Singapore', state: 'Central', pincode: '018989', postalCode: '018989' },
      { name: 'Orchard & Jurong', state: 'West', pincode: '238863', postalCode: '238863' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    defaultPincode: '11564',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. 11564',
    popularLocations: [
      { name: 'Riyadh', state: 'Riyadh', pincode: '11564', postalCode: '11564' },
      { name: 'Jeddah', state: 'Makkah', pincode: '21577', postalCode: '21577' },
      { name: 'Dammam', state: 'Eastern Province', pincode: '31422', postalCode: '31422' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    defaultPincode: '10115',
    postalCodeLabel: 'PLZ (Postleitzahl)',
    postalCodePlaceholder: 'e.g. 10115',
    popularLocations: [
      { name: 'Berlin', state: 'Berlin', pincode: '10115', postalCode: '10115' },
      { name: 'Munich', state: 'Bavaria', pincode: '80331', postalCode: '80331' },
      { name: 'Frankfurt', state: 'Hesse', pincode: '60311', postalCode: '60311' }
    ],
    get popularCities() { return this.popularLocations; }
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    defaultPincode: '75001',
    postalCodeLabel: 'Code Postal',
    postalCodePlaceholder: 'e.g. 75001',
    popularLocations: [
      { name: 'Paris', state: 'Île-de-France', pincode: '75001', postalCode: '75001' },
      { name: 'Lyon', state: 'Auvergne-Rhône-Alpes', pincode: '69001', postalCode: '69001' },
      { name: 'Marseille', state: 'Provence', pincode: '13001', postalCode: '13001' }
    ],
    get popularCities() { return this.popularLocations; }
  }
];

const COUNTRY_KEY = 'zupix_user_country_code';

export function getSavedCountryCode(): string {
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved && SUPPORTED_COUNTRIES.some(c => c.code === saved)) {
      return saved;
    }
  } catch (e) {
    console.warn(e);
  }
  return 'IN'; // Default to India
}

export function getSavedCountry(): CountryOption {
  const code = getSavedCountryCode();
  return SUPPORTED_COUNTRIES.find(c => c.code === code) || SUPPORTED_COUNTRIES[0];
}

export function setSavedCountryCode(code: string): void {
  try {
    localStorage.setItem(COUNTRY_KEY, code);
  } catch (e) {
    console.warn(e);
  }
}
