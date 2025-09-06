const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample users data
const sampleUsers = [
  // SuperAdmin users
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "SuperAdmin",
    category: "Admin",
    subcategory: "SuperAdmin",
    phone: "+1-555-0101",
    location: "New York, NY",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    subscription: "Enterprise",
    status: "Active"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "SuperAdmin",
    category: "Admin",
    subcategory: "SuperAdmin",
    phone: "+1-555-0102",
    location: "Los Angeles, CA",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    subscription: "Enterprise",
    status: "Active"
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "SuperAdmin",
    category: "Admin",
    subcategory: "SuperAdmin",
    phone: "+1-555-0103",
    location: "Chicago, IL",
    permissions: ["Full System Access", "User Management", "System Settings", "Audit Logs"],
    subscription: "Enterprise",
    status: "Inactive"
  },

  // Admin users
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Admin",
    category: "Admin",
    subcategory: "Admin",
    phone: "+1-555-0201",
    location: "Houston, TX",
    permissions: ["User Management", "Content Management", "Reports"],
    subscription: "Premium",
    status: "Active"
  },
  {
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "Admin",
    category: "Admin",
    subcategory: "Admin",
    phone: "+1-555-0202",
    location: "Phoenix, AZ",
    permissions: ["User Management", "Content Management", "Reports"],
    subscription: "Premium",
    status: "Active"
  },

  // Support Staff
  {
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Support",
    category: "Staff",
    subcategory: "Support",
    phone: "+1-555-0301",
    location: "Philadelphia, PA",
    department: "Tier 1 Support",
    subscription: "Basic",
    status: "Active",
    ticketsResolved: 156,
    avgResponseTime: "2.5 hours"
  },
  {
    name: "Lisa Davis",
    email: "lisa.davis@example.com",
    role: "Support",
    category: "Staff",
    subcategory: "Support",
    phone: "+1-555-0302",
    location: "San Antonio, TX",
    department: "Tier 2 Support",
    subscription: "Basic",
    status: "Active",
    ticketsResolved: 203,
    avgResponseTime: "1.8 hours"
  },

  // Key Manager
  {
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    role: "Key Manager",
    category: "Staff",
    subcategory: "Key Manager",
    phone: "+1-555-0401",
    location: "San Diego, CA",
    department: "Key Accounts",
    subscription: "Premium",
    status: "Active"
  },

  // Research
  {
    name: "Emily Brown",
    email: "emily.brown@example.com",
    role: "Research",
    category: "Staff",
    subcategory: "Research",
    phone: "+1-555-0501",
    location: "Dallas, TX",
    department: "R&D",
    subscription: "Basic",
    status: "Active"
  },

  // Media
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    role: "Media",
    category: "Staff",
    subcategory: "Media",
    phone: "+1-555-0601",
    location: "San Jose, CA",
    department: "Creative",
    subscription: "Basic",
    status: "Active"
  },

  // Sales
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    role: "Sales",
    category: "Staff",
    subcategory: "Sales",
    phone: "+1-555-0701",
    location: "Austin, TX",
    department: "Sales",
    subscription: "Premium",
    status: "Active"
  },

  // Suppliers
  {
    name: "David Rodriguez",
    email: "david.rodriguez@example.com",
    role: "Supplier",
    category: "Partner",
    subcategory: "Supplier",
    phone: "+1-555-0801",
    location: "Jacksonville, FL",
    subscription: "Basic",
    status: "Active"
  },
  {
    name: "Jennifer Martinez",
    email: "jennifer.martinez@example.com",
    role: "Supplier",
    category: "Partner",
    subcategory: "Supplier",
    phone: "+1-555-0802",
    location: "Fort Worth, TX",
    subscription: "Basic",
    status: "Active"
  },

  // Service Providers
  {
    name: "Christopher Lee",
    email: "christopher.lee@example.com",
    role: "Service Provider",
    category: "Partner",
    subcategory: "Service Provider",
    phone: "+1-555-0901",
    location: "Columbus, OH",
    subscription: "Basic",
    status: "Active"
  },

  // Distributors
  {
    name: "Amanda White",
    email: "amanda.white@example.com",
    role: "Distributor",
    category: "Agent",
    subcategory: "Distributor",
    phone: "+1-555-1001",
    location: "Charlotte, NC",
    subscription: "Premium",
    status: "Active"
  },
  {
    name: "Kevin Thompson",
    email: "kevin.thompson@example.com",
    role: "Distributor",
    category: "Agent",
    subcategory: "Distributor",
    phone: "+1-555-1002",
    location: "Seattle, WA",
    subscription: "Premium",
    status: "Active"
  },

  // Franchise
  {
    name: "Michelle Anderson",
    email: "michelle.anderson@example.com",
    role: "Franchise",
    category: "Agent",
    subcategory: "Franchise",
    phone: "+1-555-1101",
    location: "Denver, CO",
    subscription: "Premium",
    status: "Active"
  },

  // B2B
  {
    name: "Daniel Clark",
    email: "daniel.clark@example.com",
    role: "B2B",
    category: "Agent",
    subcategory: "B2B",
    phone: "+1-555-1201",
    location: "Washington, DC",
    subscription: "Premium",
    status: "Active"
  },

  // Public Users
  {
    name: "Ashley Lewis",
    email: "ashley.lewis@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1301",
    location: "Boston, MA",
    subscription: "Free",
    status: "Active"
  },
  {
    name: "Matthew Walker",
    email: "matthew.walker@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1302",
    location: "El Paso, TX",
    subscription: "Free",
    status: "Active"
  },
  {
    name: "Jessica Hall",
    email: "jessica.hall@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1303",
    location: "Nashville, TN",
    subscription: "Basic",
    status: "Active"
  },
  {
    name: "Andrew Allen",
    email: "andrew.allen@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1304",
    location: "Detroit, MI",
    subscription: "Premium",
    status: "Active"
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  for (const userData of sampleUsers) {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: now,
        updatedAt: now,
        lastLogin: null
      });
      console.log(`Created user: ${userData.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Failed to create user ${userData.name}:`, error);
    }
  }
  
  console.log('Database seeding completed!');
}

// Run the seeding
seedDatabase().catch(console.error);
