/**
 * OJO Tours Chatbot Knowledge Base
 *
 * This knowledge base is extracted from the application's existing content
 * including pages, database schema, and organizational information.
 */

export interface KnowledgeItem {
  id: string;
  category: string;
  keywords: string[];
  question: string;
  answer: string;
  priority: number; // Higher priority = more relevant
}

export const knowledgeBase: KnowledgeItem[] = [
  // === ORGANIZATION INFORMATION ===
  {
    id: "org-about",
    category: "organization",
    keywords: [
      "about",
      "company",
      "who",
      "ojo tours",
      "story",
      "history",
      "founded",
    ],
    question: "What is OJO Tours?",
    answer:
      "OJO Tours & Safaris was founded on a simple, yet profound principle: to share the unparalleled beauty of Rwanda with the world, while fiercely protecting the ecosystems that make it so special. Headquartered in the vibrant heart of Kigali, our team knows every hidden trail of Volcanoes National Park and every watering hole in Akagera. We are not just tour operators; we are ambassadors of our homeland.",
    priority: 10,
  },
  {
    id: "org-mission",
    category: "organization",
    keywords: ["mission", "purpose", "goal", "vision"],
    question: "What is your mission?",
    answer:
      "Our mission is to curate extraordinary, bespoke safari experiences that exceed the expectations of the modern luxury traveler, while actively contributing to the conservation of Rwanda's wildlife and the prosperity of its local communities.",
    priority: 9,
  },
  {
    id: "org-vision",
    category: "organization",
    keywords: ["vision", "future", "goal"],
    question: "What is your vision?",
    answer:
      "Our vision is to be universally recognized as East Africa's premier luxury tourism provider, setting the global standard for ethical, high-end travel and ensuring the 'Land of a Thousand Hills' thrives for generations to come.",
    priority: 9,
  },
  {
    id: "org-experience",
    category: "organization",
    keywords: ["experience", "years", "history", "how long"],
    question: "How long have you been in business?",
    answer:
      "OJO Tours has over 15 years of experience in creating bespoke safari itineraries and luxury travel experiences in Rwanda.",
    priority: 8,
  },
  {
    id: "org-location",
    category: "organization",
    keywords: ["location", "where", "headquarters", "office", "address"],
    question: "Where are you located?",
    answer:
      "Our headquarters is located at KG 7 Avenue, Heights Tower, Kigali City, Rwanda. We operate throughout Rwanda including Volcanoes National Park, Akagera National Park, and other premier destinations.",
    priority: 9,
  },
  {
    id: "org-contact",
    category: "organization",
    keywords: ["contact", "phone", "email", "call", "reach"],
    question: "How can I contact you?",
    answer:
      "You can reach us at +250 788 000 000 or email us at concierge@ojotours.com. Our business hours are Monday - Friday: 8:00 AM - 6:00 PM, with 24/7 support available for active guests. You can also chat with us on WhatsApp or fill out the contact form on our website.",
    priority: 10,
  },
  {
    id: "org-hours",
    category: "organization",
    keywords: ["hours", "open", "time", "when", "business hours"],
    question: "What are your business hours?",
    answer:
      "Our office hours are Monday - Friday: 8:00 AM - 6:00 PM. However, we provide 24/7 support for guests with active bookings to ensure your safari experience is seamless.",
    priority: 8,
  },

  // === SERVICES ===
  {
    id: "services-overview",
    category: "services",
    keywords: ["services", "offer", "provide", "do"],
    question: "What services do you offer?",
    answer:
      "We offer luxury safari experiences including gorilla trekking, wildlife safaris, cultural tours, adventure expeditions, and luxury lodge accommodations. Our services include bespoke itinerary planning, tour bookings, lodge reservations, and personalized travel experiences throughout Rwanda.",
    priority: 10,
  },
  {
    id: "services-tours",
    category: "services",
    keywords: ["tours", "safari", "packages", "trips"],
    question: "What tours do you offer?",
    answer:
      "We offer a variety of safari packages including gorilla trekking in Volcanoes National Park, wildlife safaris in Akagera, cultural experiences, adventure tours, and luxury expeditions. Each tour can be customized to your preferences. Browse our tours page to see all available packages.",
    priority: 9,
  },
  {
    id: "services-lodges",
    category: "services",
    keywords: ["lodges", "accommodation", "stay", "hotel", "lodge"],
    question: "What lodges do you offer?",
    answer:
      "We offer exclusive luxury lodges and sanctuaries throughout Rwanda, featuring eco-conscious operations, absolute privacy, and curated gastronomy. Our lodges provide world-class amenities including private infinity pools, spa services, and farm-to-table dining.",
    priority: 9,
  },
  {
    id: "services-custom",
    category: "services",
    keywords: ["custom", "bespoke", "personalized", "itinerary", "tailor"],
    question: "Can I request a custom itinerary?",
    answer:
      "Yes! We specialize in creating bespoke safari experiences tailored to your preferences. You can request a custom itinerary through our website or contact our concierge team directly. We'll work with you to design the perfect African adventure.",
    priority: 9,
  },
  {
    id: "services-group",
    category: "services",
    keywords: ["group", "team", "corporate", "family", "multiple"],
    question: "Do you offer group tours?",
    answer:
      "Yes, we accommodate group tours for families, corporate teams, and travel groups. Our team can design custom group experiences with special pricing and coordinated logistics. Contact us for group booking inquiries.",
    priority: 8,
  },

  // === DESTINATIONS ===
  {
    id: "destinations-rwanda",
    category: "destinations",
    keywords: ["destinations", "where", "locations", "places", "rwanda"],
    question: "What destinations do you cover?",
    answer:
      "We operate throughout Rwanda, the Land of a Thousand Hills. Our main destinations include Volcanoes National Park (famous for gorilla trekking), Akagera National Park (wildlife safaris), Kigali city tours, and various cultural sites across the country.",
    priority: 9,
  },
  {
    id: "destinations-gorilla",
    category: "destinations",
    keywords: ["gorilla", "trekking", "volcanoes", "mountain gorilla"],
    question: "Do you offer gorilla trekking?",
    answer:
      "Yes, gorilla trekking in Volcanoes National Park is one of our signature experiences. We organize guided treks to see the endangered mountain gorillas in their natural habitat. This is a once-in-a-lifetime experience that requires advance booking due to permit limitations.",
    priority: 10,
  },
  {
    id: "destinations-akagera",
    category: "destinations",
    keywords: ["akagera", "wildlife", "safari", "animals"],
    question: "What can I see in Akagera?",
    answer:
      "Akagera National Park offers incredible wildlife viewing including lions, elephants, giraffes, zebras, hippos, and numerous bird species. It's perfect for traditional safari experiences with game drives and boat safaris on Lake Ihema.",
    priority: 8,
  },

  // === BOOKING ===
  {
    id: "booking-how",
    category: "booking",
    keywords: ["book", "booking", "how", "reserve", "reservation"],
    question: "How do I book a tour?",
    answer:
      "You can book a tour directly through our website by browsing our tours page, selecting your preferred package, and completing the booking form. Alternatively, you can contact our concierge team at concierge@ojotours.com or call +250 788 000 000 for personalized assistance.",
    priority: 10,
  },
  {
    id: "booking-cancel",
    category: "booking",
    keywords: ["cancel", "reschedule", "change", "modify"],
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, bookings can be cancelled or rescheduled. Please contact our concierge team as soon as possible if you need to make changes. Cancellation policies vary depending on the tour and timing. We'll work with you to find the best solution.",
    priority: 9,
  },
  {
    id: "booking-payment",
    category: "booking",
    keywords: ["payment", "pay", "price", "cost", "methods"],
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods including bank transfers, credit cards, and mobile money. Payment details are provided during the booking process. For large custom bookings, we can discuss flexible payment options.",
    priority: 8,
  },
  {
    id: "booking-confirm",
    category: "booking",
    keywords: ["confirm", "confirmation", "status", "approved"],
    question: "How do I know if my booking is confirmed?",
    answer:
      "Once your booking is confirmed, you'll receive a confirmation email with all the details. You can also check your booking status in your tourist dashboard if you have an account. Our team will contact you if any additional information is needed.",
    priority: 8,
  },

  // === ACCOUNT ===
  {
    id: "account-create",
    category: "account",
    keywords: ["create", "account", "sign up", "register", "join"],
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the 'Sign Up' button on our website. You'll need to provide your email address and create a password. We use secure authentication through Supabase to protect your information.",
    priority: 9,
  },
  {
    id: "account-login",
    category: "account",
    keywords: ["login", "sign in", "access", "log in"],
    question: "How do I log in?",
    answer:
      "Click the 'Log In' button on our website and enter your email address and password. If you've forgotten your password, you can reset it through the 'Forgot Password' link. You can also log in using social authentication options if available.",
    priority: 9,
  },
  {
    id: "account-bookings",
    category: "account",
    keywords: ["bookings", "my bookings", "view", "see"],
    question: "Where can I see my bookings?",
    answer:
      "After logging in to your account, you can view all your bookings in the Tourist Dashboard under the 'My Bookings' section. There you'll see booking status, details, and upcoming trips.",
    priority: 9,
  },
  {
    id: "account-dashboard",
    category: "account",
    keywords: ["dashboard", "profile", "settings", "manage"],
    question: "What can I do in the dashboard?",
    answer:
      "In your Tourist Dashboard, you can view and manage your bookings, save items to your wishlist, write reviews, track payment history, view notifications, update your profile settings, and contact support. It's your central hub for managing your OJO Tours experience.",
    priority: 8,
  },

  // === WEBSITE ===
  {
    id: "website-navigation",
    category: "website",
    keywords: ["navigate", "find", "where is", "how to find"],
    question: "How do I navigate the website?",
    answer:
      "Our website has clear navigation in the header menu. You can find Tours, Lodges, Journal (blog), About, and Contact pages. Use the search functionality on the Tours page to filter by category or search for specific destinations.",
    priority: 7,
  },
  {
    id: "website-newsletter",
    category: "website",
    keywords: ["newsletter", "subscribe", "email", "updates"],
    question: "How can I subscribe to the newsletter?",
    answer:
      "You can subscribe to our newsletter by entering your email address in the newsletter signup form on our Journal page or homepage. Subscribers receive exclusive travel guides, conservation updates, and priority access to new itineraries.",
    priority: 8,
  },

  // === SUPPORT ===
  {
    id: "support-contact",
    category: "support",
    keywords: ["support", "help", "customer service", "assistance"],
    question: "How do I contact customer support?",
    answer:
      "You can reach our customer support team through multiple channels: email us at concierge@ojotours.com, call +250 788 000 000, use the WhatsApp chat button on our website, or fill out the contact form. For logged-in users, you can also use the Support Center in your dashboard.",
    priority: 10,
  },
  {
    id: "support-emergency",
    category: "support",
    keywords: ["emergency", "urgent", "problem", "issue"],
    question: "What if I have an emergency during my trip?",
    answer:
      "For active guests, we provide 24/7 emergency support. You'll receive emergency contact information in your booking confirmation. Our team is available around the clock to assist with any urgent matters during your safari experience.",
    priority: 10,
  },

  // === POLICIES ===
  {
    id: "policy-conservation",
    category: "policies",
    keywords: ["conservation", "environment", "eco", "sustainable"],
    question: "What is your conservation policy?",
    answer:
      "We are committed to sustainable tourism and conservation. A portion of our profits (10%) goes directly to conservation efforts. We practice eco-conscious operations, support local communities, and ensure our tours have minimal environmental impact while maximizing benefits to wildlife conservation.",
    priority: 8,
  },
  {
    id: "policy-privacy",
    category: "policies",
    keywords: ["privacy", "data", "personal information"],
    question: "How do you protect my privacy?",
    answer:
      "We take your privacy seriously and protect your personal information using industry-standard security measures. Your data is stored securely and we never share it with third parties without your consent. We comply with all applicable data protection regulations.",
    priority: 8,
  },
  {
    id: "policy-refund",
    category: "policies",
    keywords: ["refund", "money back", "cancellation policy"],
    question: "What is your refund policy?",
    answer:
      "Refund policies vary depending on the tour and timing of cancellation. Generally, cancellations made 30+ days before departure receive a full refund, 14-29 days receive 50% refund, and less than 14 days may not be refundable. Specific terms are provided during booking. Contact our team for detailed policy information.",
    priority: 8,
  },
  {
    id: "policy-insurance",
    category: "policies",
    keywords: ["insurance", "travel insurance", "coverage"],
    question: "Do you offer travel insurance?",
    answer:
      "We recommend all travelers purchase comprehensive travel insurance that covers trip cancellation, medical emergencies, and evacuation. While we don't directly sell insurance, we can provide recommendations for reputable insurance providers that cover safari travel.",
    priority: 7,
  },

  // === TOUR DETAILS ===
  {
    id: "tour-duration",
    category: "tours",
    keywords: ["duration", "length", "how long", "days"],
    question: "How long are your tours?",
    answer:
      "Our tours range from single-day excursions to multi-week expeditions. Most popular safari packages are 3-7 days, while comprehensive Rwanda experiences can be 10-14 days. Custom itineraries can be tailored to your preferred duration.",
    priority: 8,
  },
  {
    id: "tour-price",
    category: "tours",
    keywords: ["price", "cost", "how much", "expensive", "budget"],
    question: "How much do your tours cost?",
    answer:
      "Tour prices vary based on duration, accommodation level, and included activities. Prices start from approximately $500 per person for day trips to $5,000+ for luxury multi-day packages. Each tour listing shows the starting price. Contact us for detailed quotes tailored to your preferences.",
    priority: 9,
  },
  {
    id: "tour-included",
    category: "tours",
    keywords: ["included", "what's included", "covers", "contains"],
    question: "What is included in the tour price?",
    answer:
      "Most tours include accommodation, meals as specified, transportation, professional guides, park entrance fees, and mentioned activities. Specific inclusions are listed on each tour page. Some items like international flights, visas, personal expenses, and optional activities may be excluded.",
    priority: 8,
  },
  {
    id: "tour-best-time",
    category: "tours",
    keywords: ["best time", "when to visit", "season", "weather"],
    question: "When is the best time to visit Rwanda?",
    answer:
      "Rwanda is a year-round destination! The dry seasons (June-September and December-February) are ideal for gorilla trekking with easier hiking conditions. The wet seasons offer lush landscapes, fewer crowds, and excellent bird watching. Each season has unique advantages.",
    priority: 9,
  },
  {
    id: "tour-gorilla-permit",
    category: "tours",
    keywords: ["gorilla permit", "permit", "gorilla trekking permit"],
    question: "Do I need a gorilla trekking permit?",
    answer:
      "Yes, gorilla trekking requires a permit from the Rwanda Development Board. Permits are limited and must be booked in advance. We handle permit procurement as part of our gorilla trekking packages. Current permit prices are approximately $1,500 per person per trek.",
    priority: 10,
  },
  {
    id: "tour-difficulty",
    category: "tours",
    keywords: ["difficulty", "hard", "easy", "fitness", "physical"],
    question: "How physically demanding are the tours?",
    answer:
      "Physical demands vary by tour. Gorilla trekking involves hiking in mountainous terrain and can be challenging (2-8 hours). Game drives are less demanding. We offer options for various fitness levels and can customize itineraries based on your physical capabilities.",
    priority: 8,
  },

  // === LODGE DETAILS ===
  {
    id: "lodge-amenities",
    category: "lodges",
    keywords: ["amenities", "facilities", "what do lodges have", "features"],
    question: "What amenities do your lodges offer?",
    answer:
      "Our luxury lodges offer premium amenities including private infinity pools, spa services, fine dining restaurants, en-suite bathrooms, comfortable lounges, and stunning views. Specific amenities vary by property. Many lodges also offer eco-friendly features like solar power and water conservation systems.",
    priority: 8,
  },
  {
    id: "lodge-food",
    category: "lodges",
    keywords: ["food", "dining", "meals", "restaurant", "cuisine"],
    question: "What kind of food is served at the lodges?",
    answer:
      "Our lodges feature exceptional farm-to-table dining with both international cuisine and local Rwandan specialties. Most dietary requirements can be accommodated with advance notice. Meals are prepared by skilled chefs using fresh, locally-sourced ingredients.",
    priority: 7,
  },
  {
    id: "lodge-wifi",
    category: "lodges",
    keywords: ["wifi", "internet", "connection", "phone"],
    question: "Is there WiFi at the lodges?",
    answer:
      "Most of our lodges offer WiFi connectivity, though speeds may vary in remote locations. Some properties use satellite internet. We recommend checking specific lodge details for connectivity information. Many guests enjoy the opportunity to disconnect and immerse themselves in nature.",
    priority: 7,
  },

  // === TRIP PLANNING ===
  {
    id: "planning-visa",
    category: "planning",
    keywords: ["visa", "entry requirements", "passport", "documentation"],
    question: "Do I need a visa to visit Rwanda?",
    answer:
      "Most visitors can obtain a visa on arrival or apply for an e-visa online. Citizens from many countries receive visa-free entry for up to 90 days. We recommend checking current visa requirements with the Rwandan embassy or official government website before travel. We can provide guidance during booking.",
    priority: 9,
  },
  {
    id: "planning-health",
    category: "planning",
    keywords: ["health", "vaccinations", "malaria", "medicine", "shots"],
    question: "What health precautions should I take?",
    answer:
      "We recommend consulting with a travel health professional before your trip. Common recommendations include malaria prophylaxis, routine vaccinations, and considering yellow fever vaccination depending on your travel history. Rwanda has excellent medical facilities in Kigali. We provide detailed health guidelines with booking confirmations.",
    priority: 9,
  },
  {
    id: "planning-packing",
    category: "planning",
    keywords: ["packing", "what to bring", "clothes", "equipment", "gear"],
    question: "What should I pack for a safari?",
    answer:
      "We recommend packing lightweight, neutral-colored clothing, comfortable walking shoes, a hat, sunscreen, insect repellent, binoculars, camera, and any personal medications. For gorilla trekking, waterproof gear and hiking boots are essential. We provide a detailed packing list tailored to your specific itinerary.",
    priority: 8,
  },
  {
    id: "planning-currency",
    category: "planning",
    keywords: ["currency", "money", "payment", "rwandan franc", "usd"],
    question: "What currency is used in Rwanda?",
    answer:
      "The Rwandan Franc (RWF) is the local currency, but US Dollars are widely accepted at tourist establishments. Credit cards are accepted at many lodges and hotels. We recommend carrying some cash for smaller purchases and tips. ATMs are available in Kigali and major towns.",
    priority: 7,
  },
  {
    id: "planning-transport",
    category: "planning",
    keywords: [
      "transport",
      "airport",
      "transfer",
      "how to get there",
      "flights",
    ],
    question: "How do I get to Rwanda?",
    answer:
      "Kigali International Airport (KGL) is the main entry point, with direct flights from major African hubs and connections worldwide. We can arrange airport transfers as part of your package. Many travelers connect through Nairobi, Addis Ababa, or Dubai. We provide detailed travel logistics with your booking.",
    priority: 8,
  },

  // === SPECIAL REQUESTS ===
  {
    id: "special-honeymoon",
    category: "special",
    keywords: ["honeymoon", "anniversary", "romantic", "couple"],
    question: "Do you offer honeymoon packages?",
    answer:
      "Yes! We specialize in romantic honeymoon and anniversary celebrations. Our honeymoon packages include private accommodations, intimate dining experiences, special touches like champagne and flowers, and personalized itineraries. Contact us to design your perfect romantic African adventure.",
    priority: 8,
  },
  {
    id: "special-family",
    category: "special",
    keywords: ["family", "children", "kids", "multi-generational"],
    question: "Are your tours suitable for families with children?",
    answer:
      "Many of our tours are family-friendly! We have specific family packages with child-appropriate activities and accommodations. Age restrictions may apply for certain activities like gorilla trekking （minimum 15 years old）. We can customize family itineraries to ensure everyone has an amazing experience.",
    priority: 8,
  },
  {
    id: "special-accessibility",
    category: "special",
    keywords: ["accessibility", "disabled", "wheelchair", "mobility"],
    question: "Do you accommodate travelers with disabilities?",
    answer:
      "We strive to make our experiences accessible to all travelers. While some activities like gorilla trekking have physical limitations, we can adapt many tours for different mobility needs. Please discuss your specific requirements with us so we can recommend suitable options and make necessary arrangements.",
    priority: 7,
  },
  {
    id: "special-photography",
    category: "special",
    keywords: ["photography", "photo", "camera", "photographer"],
    question: "Are your tours good for photography?",
    answer:
      "Rwanda is a photographer's paradise! Our tours are designed with photographers in mind, offering excellent lighting conditions and incredible wildlife encounters. We can arrange specialized photography tours with expert guides who understand optimal positioning and timing for capturing stunning images.",
    priority: 8,
  },

  // === REVIEWS & TESTIMONIALS ===
  {
    id: "reviews-write",
    category: "reviews",
    keywords: ["review", "testimonial", "feedback", "rate"],
    question: "How can I leave a review?",
    answer:
      "After completing your tour, you'll receive an invitation to leave a review. You can also submit reviews through your tourist dashboard under the Reviews section. We value your feedback as it helps us improve and assists other travelers in planning their trips.",
    priority: 7,
  },
  {
    id: "reviews-read",
    category: "reviews",
    keywords: ["reviews", "testimonials", "what people say", "ratings"],
    question: "Where can I read customer reviews?",
    answer:
      "Customer reviews and testimonials are displayed on our website and can be found on individual tour and lodge pages. You can also check our social media channels and travel review platforms for guest experiences. We're proud of our 99% guest satisfaction rate!",
    priority: 7,
  },

  // === TECHNICAL SUPPORT ===
  {
    id: "tech-website",
    category: "technical",
    keywords: ["website", "browser", "loading", "error"],
    question: "I'm having trouble with the website",
    answer:
      "If you're experiencing technical issues with our website, please try clearing your browser cache, disabling ad blockers, or using a different browser. If problems persist, contact our support team with details of the issue and we'll assist you promptly.",
    priority: 6,
  },
  {
    id: "tech-dashboard",
    category: "technical",
    keywords: ["dashboard", "login", "account access", "can't log in"],
    question: "I can't access my dashboard",
    answer:
      "If you're having trouble accessing your dashboard, first try resetting your password using the 'Forgot Password' link. If that doesn't work, ensure you're using the correct email address. Contact our support team if you continue to experience issues and we'll help resolve them.",
    priority: 7,
  },
];

// Category mapping for better organization
export const knowledgeCategories = {
  organization: "About OJO Tours",
  services: "Our Services",
  destinations: "Destinations",
  booking: "Booking & Reservations",
  account: "Account Management",
  website: "Website Navigation",
  support: "Customer Support",
  policies: "Policies & Guidelines",
  tours: "Tour Information",
  lodges: "Lodge Details",
  planning: "Trip Planning",
  special: "Special Requests",
  reviews: "Reviews & Testimonials",
  technical: "Technical Support",
};

// Out-of-scope response for unrelated questions
export const outOfScopeResponse =
  "I'm here to assist with questions about our organization, tours, destinations, bookings, and services. I can't answer questions outside of those topics. For other inquiries, please contact our team directly.";
