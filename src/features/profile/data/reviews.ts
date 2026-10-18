import { Review } from "../types/reviews";

export const REVIEWS: Review[] = [
  // Row 1 - Static
  {
    id: "r1",
    content: "The consultation call literally saved us over ₹6 Lakhs! Aryan broke down the actual material rates and itemized BOQ so our contractor couldn't inflate prices.",
    rating: 5,
    author: {
      name: "Aman Singhania",
      title: "Villa Owner, Alibaug",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania",
      verified: true,
    },
  },
  {
    id: "r2",
    content: "Loved the direct, transparent approach. No pushing expensive vendor tie-ups, just pure functional design and sustainable material alternatives.",
    rating: 5,
    author: {
      name: "Rishi Vardhan",
      title: "Duplex Renovation, Mumbai",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan",
      verified: true,
    },
  },
  {
    id: "r3",
    content: "Aryan gave us exceptional guidelines on selecting contractors and key milestone payment clauses to avoid project delays. Highly recommend him!",
    rating: 5,
    author: {
      name: "Shruti & Vikram",
      title: "Penthouse Clients, Pune",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram",
      verified: true,
    },
  },

  // Row 2 - Scrolling left
  {
    id: "r4",
    content: "Within 20 minutes, Aryan pointed out a massive structural column conflict in our builder's drawing that would have ruined our living room lighting.",
    rating: 5,
    author: {
      name: "Kabir Sen",
      title: "Apartment Buyer, Bangalore",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=KabirSen",
      verified: true,
    },
  },
  {
    id: "r5",
    content: "Studio Mehta taught us how to actually audit site work and verify MEP (mechanical/electrical) ducting before closing false ceilings. Lifesaver!",
    rating: 5,
    author: {
      name: "Tanya Kapoor",
      title: "Homeowner, Gurugram",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=TanyaKapoor",
      verified: true,
    },
  },
  {
    id: "r6",
    content: "Super easy to communicate with. Felt like having a trusted principal architect on speed dial who genuinely cares about your budget.",
    rating: 5,
    author: {
      name: "Sahil Deshmukh",
      title: "Private Residence, Goa",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SahilDeshmukh",
      verified: true,
    },
  },
  {
    id: "r7",
    content: "No sugarcoating, just real architectural insight on what materials last long in coastal climates. Worth 10x the consultation fee.",
    rating: 5,
    author: {
      name: "Meghna Nair",
      title: "Architectural Enthusiast, Kochi",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MeghnaNair",
      verified: true,
    },
  },
  {
    id: "r8",
    content: "The BOQ review was immaculate. We caught several redundant items in the HVAC estimate. Absolute game changer.",
    rating: 5,
    author: {
      name: "Ravi Teja",
      title: "Commercial Studio, Hyderabad",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RaviTeja",
      verified: true,
    },
  },

  // Row 3 - Scrolling right
  {
    id: "r9",
    content: "We were about to overspend significantly on imported marble. Aryan suggested Indian composite stones that look identical and cost 60% less.",
    rating: 5,
    author: {
      name: "Dhruv Merchant",
      title: "Townhouse Owner, Ahmedabad",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DhruvMerchant",
      verified: true,
    },
  },
  {
    id: "r10",
    content: "Clear, direct, and visionary. He re-imagined our master suite layout to incorporate cross ventilation and maximum natural morning light.",
    rating: 5,
    author: {
      name: "Kritika Malhotra",
      title: "Apartment Renovation, Delhi",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=KritikaMalhotra",
      verified: true,
    },
  },
  {
    id: "r11",
    content: "Aryan's e-book on turnkey budgeting is gold. We used his contractor evaluation checklist and saved thousands on timber framing.",
    rating: 5,
    author: {
      name: "Varun Sharma",
      title: "Self-Builder, Chandigarh",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=VarunSharma",
      verified: true,
    },
  },
  {
    id: "r12",
    content: "The invoice and estimation templates from Studio Mehta made dealing with vendors 100% dispute-free. Fantastic work!",
    rating: 4,
    author: {
      name: "Simran Johar",
      title: "Interior Client, Mumbai",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SimranJohar",
      verified: true,
    },
  },
  {
    id: "r13",
    content: "Unmatched aesthetic sense combined with practical civil engineering knowledge. Highly recommended to anyone building their dream home.",
    rating: 5,
    author: {
      name: "Karan Oberoi",
      title: "Farmhouse Owner, Alibaug",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=KaranOberoi",
      verified: true,
    },
  },
];

// Split reviews into 3 rows
export const REVIEWS_ROW_1 = REVIEWS.slice(0, 3);
export const REVIEWS_ROW_2 = REVIEWS.slice(3, 8);
export const REVIEWS_ROW_3 = REVIEWS.slice(8, 13);

export const TOTAL_REVIEWS = 127;
export const AVERAGE_RATING = 4.9;

export const RATING_DISTRIBUTION = [
  { star: 5, count: 115 },
  { star: 4, count: 10 },
  { star: 3, count: 2 },
  { star: 2, count: 0 },
  { star: 1, count: 0 },
];
