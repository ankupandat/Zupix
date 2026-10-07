// Smart Location, GPS Detection & Global Google Maps-Grade Location Search Engine for Zupix

export interface LocationSuggestion {
  id: string;
  name: string;
  pincode: string;
  city: string;
  state: string;
  country?: string;
  countryCode?: string;
  landmark?: string;
  formattedAddress?: string;
  type: 'area' | 'city' | 'sector' | 'service' | 'global_place';
  category?: string;
  iconName?: string;
  lat?: number;
  lon?: number;
}

export const POPULAR_LOCATIONS: LocationSuggestion[] = [
  // Delhi & NCR
  { id: 'del-cp', name: 'Connaught Place', pincode: '110001', city: 'Central Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Rajiv Chowk / Barakhamba', type: 'area' },
  { id: 'del-south-ex', name: 'South Extension', pincode: '110049', city: 'South Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Part 1 & 2 / Ring Road', type: 'area' },
  { id: 'del-lajpat', name: 'Lajpat Nagar', pincode: '110024', city: 'South Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Central Market', type: 'area' },
  { id: 'del-saket', name: 'Saket & Malviya Nagar', pincode: '110017', city: 'South Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Select Citywalk', type: 'area' },
  { id: 'del-hauz-khas', name: 'Hauz Khas & Green Park', pincode: '110016', city: 'South Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'IIT Flyover / Market', type: 'area' },
  { id: 'del-dwarka', name: 'Dwarka (Sector 1-23)', pincode: '110075', city: 'South West Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Sector 6/10 Main Market', type: 'sector' },
  { id: 'del-rohini', name: 'Rohini (Sector 1-18)', pincode: '110085', city: 'North West Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'DC Chowk / Metro', type: 'sector' },
  { id: 'del-karol-bagh', name: 'Karol Bagh & Patel Nagar', pincode: '110005', city: 'Central Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Gaffar Market', type: 'area' },
  { id: 'del-janakpuri', name: 'Janakpuri & Tilak Nagar', pincode: '110058', city: 'West Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'District Centre', type: 'area' },
  { id: 'del-vasant-kunj', name: 'Vasant Kunj & Vasant Vihar', pincode: '110070', city: 'South Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'Ambience Mall', type: 'area' },
  { id: 'del-pitampura', name: 'Pitampura & Netaji Subhash Place', pincode: '110034', city: 'North Delhi', state: 'Delhi', country: 'India', countryCode: 'IN', landmark: 'NSP Complex', type: 'area' },
  
  // Gurgaon / Gurugram
  { id: 'ggn-cyber', name: 'Cyber City & DLF Phase 2', pincode: '122002', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Cyber Hub / Rapid Metro', type: 'area' },
  { id: 'ggn-dlf-phase1', name: 'DLF Phase 1 & 4', pincode: '122009', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Galleria Market', type: 'area' },
  { id: 'ggn-dlf-phase3', name: 'DLF Phase 3 & Ambience', pincode: '122010', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Moulsari Avenue', type: 'area' },
  { id: 'ggn-dlf-phase5', name: 'DLF Phase 5 & Golf Course Rd', pincode: '122011', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'One Horizon Center', type: 'area' },
  { id: 'ggn-sec14-15', name: 'Sector 14 & Sector 15', pincode: '122001', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Old Railway Road', type: 'sector' },
  { id: 'ggn-sec29-43', name: 'Sector 29 & Sector 43', pincode: '122003', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Huda City Centre', type: 'sector' },
  { id: 'ggn-sec56-57', name: 'Sector 56 & Sector 57', pincode: '122011', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Hong Kong Bazar', type: 'sector' },
  { id: 'ggn-sohna-rd', name: 'Sohna Road (Sector 47-49)', pincode: '122018', city: 'Gurugram', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Vipul Trade Center', type: 'sector' },

  // Noida & Greater Noida
  { id: 'noida-sec18', name: 'Sector 18 & Atta Market', pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Mall of India', type: 'sector' },
  { id: 'noida-sec62', name: 'Sector 62 & Sector 63', pincode: '201309', city: 'Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Fortis Hospital / Tech Hub', type: 'sector' },
  { id: 'noida-sec128', name: 'Sector 128 & Jaypee Greens', pincode: '201304', city: 'Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Noida Expressway', type: 'sector' },
  { id: 'noida-sec137', name: 'Sector 137 & Sector 143', pincode: '201305', city: 'Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Metro Aqua Line', type: 'sector' },
  { id: 'noida-sec50-76', name: 'Sector 50, 75 & 76', pincode: '201307', city: 'Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Spectrum Metro', type: 'sector' },
  { id: 'gzb-indirapuram', name: 'Indirapuram & Vaishali', pincode: '201014', city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Shipra Mall', type: 'area' },
  { id: 'gr-noida-pari', name: 'Pari Chowk & Alpha 1', pincode: '201310', city: 'Greater Noida', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Knowledge Park', type: 'area' },

  // Chandigarh, Mohali & Panchkula
  { id: 'chd-sec17', name: 'Sector 17 & Sector 22', pincode: '160017', city: 'Chandigarh', state: 'Chandigarh', country: 'India', countryCode: 'IN', landmark: 'Plaza & ISBT 17', type: 'sector' },
  { id: 'chd-sec35', name: 'Sector 35 & Sector 34', pincode: '160035', city: 'Chandigarh', state: 'Chandigarh', country: 'India', countryCode: 'IN', landmark: 'Sub City Centre', type: 'sector' },
  { id: 'chd-sec8-9', name: 'Sector 8 & Sector 9', pincode: '160009', city: 'Chandigarh', state: 'Chandigarh', country: 'India', countryCode: 'IN', landmark: 'Inner Market', type: 'sector' },
  { id: 'mohali-ph7', name: 'Phase 7 & Phase 3B2', pincode: '160059', city: 'Mohali (SAS Nagar)', state: 'Punjab', country: 'India', countryCode: 'IN', landmark: 'Phase 7 Market', type: 'sector' },
  { id: 'mohali-sec70', name: 'Sector 70 & Sector 71', pincode: '160071', city: 'Mohali', state: 'Punjab', country: 'India', countryCode: 'IN', landmark: 'Matour / Airport Rd', type: 'sector' },
  { id: 'pkl-sec8-9', name: 'Sector 8 & Sector 9', pincode: '134109', city: 'Panchkula', state: 'Haryana', country: 'India', countryCode: 'IN', landmark: 'Main Market', type: 'sector' },
  { id: 'chd-manimajra', name: 'Manimajra & IT Park', pincode: '160101', city: 'Chandigarh', state: 'Chandigarh', country: 'India', countryCode: 'IN', landmark: 'DLF City Centre Mall', type: 'area' },

  // Mumbai & MMR
  { id: 'mum-colaba', name: 'Colaba & Nariman Point', pincode: '400001', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Gateway of India', type: 'area' },
  { id: 'mum-bandra-w', name: 'Bandra West (Hill Rd / Carter Rd)', pincode: '400050', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Linking Road', type: 'area' },
  { id: 'mum-andheri-w', name: 'Andheri West & Lokhandwala', pincode: '400053', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Infinity Mall', type: 'area' },
  { id: 'mum-andheri-e', name: 'Andheri East & MIDC', pincode: '400069', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Chakala Metro', type: 'area' },
  { id: 'mum-juhu', name: 'Juhu & Vile Parle', pincode: '400049', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Juhu Beach / ISKCON', type: 'area' },
  { id: 'mum-powai', name: 'Powai & Hiranandani', pincode: '400076', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'IIT Bombay / Galleria', type: 'area' },
  { id: 'mum-thane-w', name: 'Thane West (Ghodbunder Rd)', pincode: '400601', city: 'Thane', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Viviana Mall', type: 'area' },
  { id: 'mum-navi-vashi', name: 'Vashi & Nerul', pincode: '400703', city: 'Navi Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Inorbit Mall', type: 'area' },
  { id: 'mum-borivali', name: 'Borivali West & IC Colony', pincode: '400092', city: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Link Road', type: 'area' },

  // Bengaluru
  { id: 'blr-koramangala', name: 'Koramangala (Blocks 1-8)', pincode: '560034', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: 'Sony World Junction / Forum', type: 'area' },
  { id: 'blr-indiranagar', name: 'Indiranagar (100ft & 12th Main)', pincode: '560038', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: 'CMH Road / Metro', type: 'area' },
  { id: 'blr-hsr', name: 'HSR Layout (Sectors 1-7)', pincode: '560102', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: '27th Main / BDA Complex', type: 'sector' },
  { id: 'blr-whitefield', name: 'Whitefield & ITPL', pincode: '560066', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: 'Phoenix Marketcity', type: 'area' },
  { id: 'blr-jayanagar', name: 'Jayanagar (Blocks 1-9)', pincode: '560041', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: '4th Block Complex', type: 'area' },
  { id: 'blr-electronic-city', name: 'Electronic City Phase 1 & 2', pincode: '560100', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: 'Infosys Gate / Elevated Flyover', type: 'area' },
  { id: 'blr-marathahalli', name: 'Marathahalli & Outer Ring Rd', pincode: '560037', city: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', landmark: 'Multiplex Bridge', type: 'area' },

  // Hyderabad
  { id: 'hyd-banjara', name: 'Banjara Hills (Roads 1-14)', pincode: '500034', city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', landmark: 'GVK One / Care Hospital', type: 'area' },
  { id: 'hyd-jubilee', name: 'Jubilee Hills (Roads 36 & 45)', pincode: '500033', city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', landmark: 'Peddamma Temple', type: 'area' },
  { id: 'hyd-hitec', name: 'Hitec City & Madhapur', pincode: '500081', city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', landmark: 'Cyber Towers / Inorbit', type: 'area' },
  { id: 'hyd-gachibowli', name: 'Gachibowli & Financial District', pincode: '500032', city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', landmark: 'ISB / Wipro Circle', type: 'area' },
  { id: 'hyd-kukatpally', name: 'Kukatpally & KPHB Colony', pincode: '500072', city: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', landmark: 'Forum Sujana Mall', type: 'area' },

  // Pune
  { id: 'pune-koregaon', name: 'Koregaon Park & Kalyani Nagar', pincode: '411001', city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'North Main Road', type: 'area' },
  { id: 'pune-viman-nagar', name: 'Viman Nagar & Nagar Road', pincode: '411014', city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Phoenix Market City', type: 'area' },
  { id: 'pune-hinjewadi', name: 'Hinjewadi Phase 1, 2, 3', pincode: '411057', city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Rajiv Gandhi Infotech Park', type: 'sector' },
  { id: 'pune-wakad', name: 'Wakad & Baner', pincode: '411045', city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'Balewadi High Street', type: 'area' },
  { id: 'pune-kothrud', name: 'Kothrud & Karve Nagar', pincode: '411038', city: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', landmark: 'MIT College Road', type: 'area' },

  // Jaipur
  { id: 'jpr-malviya', name: 'Malviya Nagar & GT Road', pincode: '302017', city: 'Jaipur', state: 'Rajasthan', country: 'India', countryCode: 'IN', landmark: 'World Trade Park (WTP)', type: 'area' },
  { id: 'jpr-vaishali', name: 'Vaishali Nagar & Chitrakoot', pincode: '302021', city: 'Jaipur', state: 'Rajasthan', country: 'India', countryCode: 'IN', landmark: 'Amrapali Circle', type: 'area' },
  { id: 'jpr-c-scheme', name: 'C-Scheme & Civil Lines', pincode: '302001', city: 'Jaipur', state: 'Rajasthan', country: 'India', countryCode: 'IN', landmark: 'Statue Circle', type: 'area' },
  { id: 'jpr-mansarovar', name: 'Mansarovar (Sector 1-12)', pincode: '302020', city: 'Jaipur', state: 'Rajasthan', country: 'India', countryCode: 'IN', landmark: 'VT Road / Metro', type: 'sector' },

  // Kolkata
  { id: 'kol-saltlake', name: 'Salt Lake (Sector 1-5)', pincode: '700091', city: 'Kolkata', state: 'West Bengal', country: 'India', countryCode: 'IN', landmark: 'City Centre 1 & 2', type: 'sector' },
  { id: 'kol-newtown', name: 'New Town (Action Area 1-3)', pincode: '700156', city: 'Kolkata', state: 'West Bengal', country: 'India', countryCode: 'IN', landmark: 'Eco Space / Biswa Bangla', type: 'sector' },
  { id: 'kol-parkstreet', name: 'Park Street & Camac Street', pincode: '700016', city: 'Kolkata', state: 'West Bengal', country: 'India', countryCode: 'IN', landmark: 'Flurys / Allen Park', type: 'area' },

  // Chennai
  { id: 'chn-tnagar', name: 'T. Nagar & Pondy Bazaar', pincode: '600017', city: 'Chennai', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', landmark: 'Panagal Park', type: 'area' },
  { id: 'chn-adyar', name: 'Adyar & Besant Nagar', pincode: '600020', city: 'Chennai', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', landmark: 'Elliot Beach', type: 'area' },
  { id: 'chn-omr', name: 'OMR (Thoraipakkam / Sholinganallur)', pincode: '600119', city: 'Chennai', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', landmark: 'Tidel Park / IT Corridor', type: 'area' },

  // Lucknow
  { id: 'lko-gomti', name: 'Gomti Nagar & Gomti Extension', pincode: '226010', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Patrakarpuram / Phoenix Palassio', type: 'area' },
  { id: 'lko-hazratganj', name: 'Hazratganj & Aliganj', pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', landmark: 'Ganj Market', type: 'area' },

  // Ahmedabad
  { id: 'ahd-sg-highway', name: 'SG Highway & Bodakdev', pincode: '380054', city: 'Ahmedabad', state: 'Gujarat', country: 'India', countryCode: 'IN', landmark: 'ISCON Mega Mall', type: 'area' },
  { id: 'ahd-satellite', name: 'Satellite & Vastrapur', pincode: '380015', city: 'Ahmedabad', state: 'Gujarat', country: 'India', countryCode: 'IN', landmark: 'Vastrapur Lake / Alpha One', type: 'area' },

  // Global Worldwide Major Cities & Zones
  // USA
  { id: 'us-nyc', name: 'Manhattan & Brooklyn', pincode: '10001', city: 'New York', state: 'NY', country: 'United States', countryCode: 'US', landmark: 'Times Square / Broadway', type: 'area' },
  { id: 'us-la', name: 'Downtown & Hollywood', pincode: '90001', city: 'Los Angeles', state: 'CA', country: 'United States', countryCode: 'US', landmark: 'Sunset Blvd', type: 'area' },
  { id: 'us-sf', name: 'Downtown & Silicon Valley', pincode: '94102', city: 'San Francisco', state: 'CA', country: 'United States', countryCode: 'US', landmark: 'Market Street', type: 'area' },
  { id: 'us-chicago', name: 'The Loop & River North', pincode: '60601', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', landmark: 'Michigan Avenue', type: 'area' },
  
  // UK
  { id: 'gb-london', name: 'Central London & Westminster', pincode: 'EC1A 1BB', city: 'London', state: 'Greater London', country: 'United Kingdom', countryCode: 'GB', landmark: 'Oxford Street / Soho', type: 'area' },
  { id: 'gb-manchester', name: 'City Centre & Deansgate', pincode: 'M1 1AE', city: 'Manchester', state: 'Greater Manchester', country: 'United Kingdom', countryCode: 'GB', landmark: 'Arndale', type: 'area' },
  
  // UAE
  { id: 'ae-dubai', name: 'Downtown Dubai & Marina', pincode: '337-1500', city: 'Dubai', state: 'Dubai', country: 'UAE', countryCode: 'AE', landmark: 'Burj Khalifa / Marina', type: 'area' },
  { id: 'ae-abudhabi', name: 'Corniche & Downtown', pincode: '00000', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', landmark: 'Abu Dhabi Mall', type: 'area' },

  // Canada & Australia & Singapore
  { id: 'ca-toronto', name: 'Downtown Toronto & Yorkville', pincode: 'M5V 2T6', city: 'Toronto', state: 'ON', country: 'Canada', countryCode: 'CA', landmark: 'CN Tower', type: 'area' },
  { id: 'au-sydney', name: 'Sydney CBD & Darling Harbour', pincode: '2000', city: 'Sydney', state: 'NSW', country: 'Australia', countryCode: 'AU', landmark: 'George Street', type: 'area' },
  { id: 'sg-singapore', name: 'Orchard Road & Marina Bay', pincode: '018989', city: 'Singapore', state: 'Central', country: 'Singapore', countryCode: 'SG', landmark: 'Marina Bay Sands', type: 'area' }
];

export interface AutoCompleteResult {
  locations: LocationSuggestion[];
  services: Array<{ title: string; category: string; icon: string; keyword: string }>;
  specialists: Array<{ name: string; category: string; pincode: string; rating: number }>;
}

// In-memory geocoding search cache to provide instant responses
const placesSearchCache = new Map<string, LocationSuggestion[]>();

/**
 * Live Google Maps-Grade Global Location Search
 * Queries OpenStreetMap / Photon geocoding worldwide with caching and instant fallbacks.
 * Matches any country, state, city, neighbourhood, street, or postal code in the world.
 */
export async function searchGlobalPlaces(
  query: string, 
  countryFilter?: string
): Promise<LocationSuggestion[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) {
    return POPULAR_LOCATIONS.slice(0, 8);
  }

  const cacheKey = `${clean.toLowerCase()}_${countryFilter || 'ALL'}`;
  if (placesSearchCache.has(cacheKey)) {
    return placesSearchCache.get(cacheKey)!;
  }

  // 1. Instant local indexed search first
  const cleanLower = clean.toLowerCase();
  const localMatches = POPULAR_LOCATIONS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(cleanLower) ||
      loc.pincode.toLowerCase().includes(cleanLower) ||
      loc.city.toLowerCase().includes(cleanLower) ||
      loc.state.toLowerCase().includes(cleanLower) ||
      (loc.country && loc.country.toLowerCase().includes(cleanLower)) ||
      (loc.landmark && loc.landmark.toLowerCase().includes(cleanLower))
    );
  });

  // 2. Fetch live global places from Photon Geocoding API (OpenStreetMap worldwide engine)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(clean)}&limit=6`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      const features: any[] = data.features || [];

      const fetchedPlaces: LocationSuggestion[] = features.map((f, idx) => {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const name = p.name || p.street || p.city || clean;
        const city = p.city || p.town || p.county || p.state || 'Global Area';
        const state = p.state || p.district || '';
        const country = p.country || '';
        const countryCode = (p.countrycode || '').toUpperCase();
        const postcode = p.postcode || '00000';
        const formatted = [name, city, state, country].filter(Boolean).join(', ');

        return {
          id: `global-${p.osm_id || idx}-${Date.now()}`,
          name: name,
          city: city,
          state: state,
          country: country,
          countryCode: countryCode,
          pincode: postcode,
          formattedAddress: formatted,
          landmark: country ? `${state ? `${state}, ` : ''}${country}` : undefined,
          type: 'global_place',
          lon: coords[0],
          lat: coords[1]
        };
      });

      // Deduplicate and combine local + fetched places
      const combined = [...localMatches];
      fetchedPlaces.forEach(fp => {
        if (!combined.some(c => c.name.toLowerCase() === fp.name.toLowerCase() && c.city.toLowerCase() === fp.city.toLowerCase())) {
          combined.push(fp);
        }
      });

      const finalResult = combined.slice(0, 10);
      placesSearchCache.set(cacheKey, finalResult);
      return finalResult;
    }
  } catch (err) {
    // Graceful fallback to instant local matches on timeout or network block
  }

  placesSearchCache.set(cacheKey, localMatches.slice(0, 8));
  return localMatches.slice(0, 8);
}

/**
 * Instagram-style instant fuzzy matcher
 * Matches locations, sectors, pincodes, categories, and specialists with instantaneous feedback
 */
export function getSmartSearchSuggestions(
  query: string,
  existingWorkers: Array<{ name: string; category: string; pincode: string; rating: number }> = [],
  cachedGlobalPlaces: LocationSuggestion[] = []
): AutoCompleteResult {
  const clean = query.toLowerCase().trim();
  if (!clean) {
    // Return top popular trending areas by default
    return {
      locations: POPULAR_LOCATIONS.slice(0, 7),
      services: [
        { title: 'Doctor / General Physician', category: 'Doctor / General Physician', icon: 'stethoscope', keyword: 'doctor' },
        { title: 'Plumbing & Leak Repairs', category: 'Plumbing', icon: 'wrench', keyword: 'plumber' },
        { title: 'Electrical & Wiring', category: 'Electrical', icon: 'zap', keyword: 'electrician' },
        { title: 'AC Service & Gas Filling', category: 'AC & Refrigeration', icon: 'wind', keyword: 'ac' }
      ],
      specialists: []
    };
  }

  // 1. Match Locations & Pincodes from local dataset + cached global places
  const allPool = [...POPULAR_LOCATIONS, ...cachedGlobalPlaces];
  const seenIds = new Set<string>();
  const matchedLocations = allPool.filter((loc) => {
    if (seenIds.has(loc.name + loc.pincode)) return false;
    const isMatch = (
      loc.name.toLowerCase().includes(clean) ||
      loc.pincode.toLowerCase().includes(clean) ||
      loc.city.toLowerCase().includes(clean) ||
      loc.state.toLowerCase().includes(clean) ||
      (loc.country && loc.country.toLowerCase().includes(clean)) ||
      (loc.landmark && loc.landmark.toLowerCase().includes(clean))
    );
    if (isMatch) {
      seenIds.add(loc.name + loc.pincode);
      return true;
    }
    return false;
  }).slice(0, 8);

  // 2. Match Service Categories
  const ALL_SERVICES = [
    { title: 'Doctor / General Physician', category: 'Doctor / General Physician', icon: 'stethoscope', keyword: 'doctor clinic physician health mbbs fever cough medicine' },
    { title: 'Plumbing Services & Leak Fix', category: 'Plumbing', icon: 'wrench', keyword: 'plumber tap pipe water leak tank bathroom toilet' },
    { title: 'Electrical Repair & Installation', category: 'Electrical', icon: 'zap', keyword: 'electrician short circuit switch fan light mcb wiring fuse' },
    { title: 'AC & Refrigeration Repair', category: 'AC & Refrigeration', icon: 'wind', keyword: 'ac air conditioner fridge cooling compressor gas repair hvac' },
    { title: 'Salon, Makeup & Grooming', category: 'Salon & Makeup', icon: 'scissors', keyword: 'salon beauty makeup facial hair waxing haircut massage' },
    { title: 'Carpentry & Woodwork', category: 'Carpentry', icon: 'hammer', keyword: 'carpenter wood door lock furniture repair bed sofa cupboard' },
    { title: 'Cleaning & Pest Control', category: 'Cleaning & Pest Control', icon: 'spray', keyword: 'clean pest sanitization cockroach termite deep cleaning disinfection' },
    { title: 'Home Painting & Whitewash', category: 'Home Painting', icon: 'brush', keyword: 'painter painting wall color polish texture primer waterproof' },
    { title: 'Appliance Repair Pro', category: 'Appliance Repair', icon: 'tool', keyword: 'appliance washing machine geyser microwave oven chimney ro filter' }
  ];

  const matchedServices = ALL_SERVICES.filter(s => {
    return s.title.toLowerCase().includes(clean) || s.keyword.includes(clean);
  }).slice(0, 4);

  // 3. Match Verified Specialists (Workers)
  const matchedSpecialists = existingWorkers.filter(w => {
    return (
      w.name.toLowerCase().includes(clean) ||
      w.category.toLowerCase().includes(clean) ||
      w.pincode.includes(clean)
    );
  }).slice(0, 4);

  return {
    locations: matchedLocations,
    services: matchedServices,
    specialists: matchedSpecialists
  };
}

/**
 * Coordinate-based approximate regional lookup (fallback when offline or rapid response)
 */
function approximateLocationFromCoords(lat: number, lon: number): { pincode: string; city: string; area: string } {
  // Delhi NCR Box: lat 28.3 - 28.9, lon 76.8 - 77.5
  if (lat >= 28.3 && lat <= 28.9 && lon >= 76.8 && lon <= 77.5) {
    if (lat >= 28.55 && lon >= 77.15 && lon <= 77.28) {
      return { pincode: '110016', city: 'South Delhi', area: 'Hauz Khas / Saket / Green Park' };
    }
    if (lat < 28.50 && lon < 77.10) {
      return { pincode: '122002', city: 'Gurugram', area: 'DLF Cyber City / Sector 29' };
    }
    if (lon > 77.30) {
      return { pincode: '201301', city: 'Noida', area: 'Sector 18 / Atta Market' };
    }
    return { pincode: '110001', city: 'Central Delhi', area: 'Connaught Place / Barakhamba' };
  }

  // Chandigarh Box: lat 30.6 - 30.85, lon 76.6 - 76.9
  if (lat >= 30.6 && lat <= 30.85 && lon >= 76.6 && lon <= 76.9) {
    if (lon < 76.73) {
      return { pincode: '160059', city: 'Mohali', area: 'Phase 7 / Sector 70' };
    }
    if (lon > 76.82) {
      return { pincode: '134109', city: 'Panchkula', area: 'Sector 8 / Sector 9' };
    }
    return { pincode: '160017', city: 'Chandigarh', area: 'Sector 17 / Sector 22 Plaza' };
  }

  // Mumbai Box: lat 18.8 - 19.35, lon 72.7 - 73.1
  if (lat >= 18.8 && lat <= 19.35 && lon >= 72.7 && lon <= 73.1) {
    if (lat >= 19.10) {
      return { pincode: '400053', city: 'Mumbai', area: 'Andheri West / Lokhandwala' };
    }
    return { pincode: '400050', city: 'Mumbai', area: 'Bandra West / Linking Rd' };
  }

  // Bengaluru Box: lat 12.8 - 13.15, lon 77.45 - 77.8
  if (lat >= 12.8 && lat <= 13.15 && lon >= 77.45 && lon <= 77.8) {
    return { pincode: '560034', city: 'Bengaluru', area: 'Koramangala / HSR Layout' };
  }

  // Hyderabad Box: lat 17.25 - 17.6, lon 78.25 - 78.65
  if (lat >= 17.25 && lat <= 17.6 && lon >= 78.25 && lon <= 78.65) {
    return { pincode: '500081', city: 'Hyderabad', area: 'Hitec City / Madhapur' };
  }

  // Pune Box: lat 18.4 - 18.7, lon 73.7 - 74.0
  if (lat >= 18.4 && lat <= 18.7 && lon >= 73.7 && lon <= 74.0) {
    return { pincode: '411001', city: 'Pune', area: 'Koregaon Park / Kalyani Nagar' };
  }

  // Jaipur Box: lat 26.75 - 27.05, lon 75.65 - 76.0
  if (lat >= 26.75 && lat <= 27.05 && lon >= 75.65 && lon <= 76.0) {
    return { pincode: '302017', city: 'Jaipur', area: 'Malviya Nagar / WTP' };
  }

  // Generic India / default
  return { pincode: '110001', city: 'Central Delhi', area: 'Detected GPS Location' };
}

export interface GeolocationResult {
  success: boolean;
  pincode?: string;
  city?: string;
  area?: string;
  address?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

/**
 * GPS Live Location Detection with OpenStreetMap Reverse Geocoding & High-Speed Fallback
 */
export async function detectCurrentLocation(): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser.'
    };
  }

  return new Promise((resolve) => {
    // Set 6 second timeout for GPS response
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Location request timed out. Please enter your pincode manually or select from the list.'
      });
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeoutId);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim with a 2.5s race timeout
          const controller = new AbortController();
          const reqTimeout = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
              signal: controller.signal
            }
          );
          clearTimeout(reqTimeout);

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const pincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : null;
            const city = addr.city || addr.town || addr.district || addr.state_district || addr.state || 'Local Zone';
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || city;
            const formatted = [area, city, pincode].filter(Boolean).join(', ');

            if (pincode && pincode.length === 6) {
              resolve({
                success: true,
                pincode: pincode,
                city: city,
                area: area,
                address: formatted,
                formattedAddress: formatted,
                latitude: lat,
                longitude: lon
              });
              return;
            }
          }
        } catch (e) {
          console.warn('Live Nominatim reverse geocode failed or aborted, using smart coordinate box:', e);
        }

        // Coordinate bounding box fallback
        const fallback = approximateLocationFromCoords(lat, lon);
        resolve({
          success: true,
          pincode: fallback.pincode,
          city: fallback.city,
          area: fallback.area,
          address: `${fallback.area}, ${fallback.city} (${fallback.pincode})`,
          formattedAddress: `${fallback.area}, ${fallback.city}`,
          latitude: lat,
          longitude: lon
        });
      },
      (err) => {
        clearTimeout(timeoutId);
        let errorMsg = 'Could not access GPS location.';
        if (err.code === 1) {
          errorMsg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          errorMsg = 'Location position unavailable. Please enter pincode manually.';
        } else if (err.code === 3) {
          errorMsg = 'Location request timed out.';
        }
        resolve({
          success: false,
          error: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000
      }
    );
  });
}
