import { CreateUserData } from './types/user'

export const sampleUsers: CreateUserData[] = [
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
    subscription: "Enterprise"
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
    subscription: "Enterprise"
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
    subscription: "Enterprise"
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
    subscription: "Premium"
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
    subscription: "Premium"
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
    subscription: "Basic"
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
    subscription: "Basic"
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
    subscription: "Premium"
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
    subscription: "Basic"
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
    subscription: "Basic"
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
    subscription: "Premium"
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
    subscription: "Basic"
  },
  {
    name: "Jennifer Martinez",
    email: "jennifer.martinez@example.com",
    role: "Supplier",
    category: "Partner",
    subcategory: "Supplier",
    phone: "+1-555-0802",
    location: "Fort Worth, TX",
    subscription: "Basic"
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
    subscription: "Basic"
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
    subscription: "Premium"
  },
  {
    name: "Kevin Thompson",
    email: "kevin.thompson@example.com",
    role: "Distributor",
    category: "Agent",
    subcategory: "Distributor",
    phone: "+1-555-1002",
    location: "Seattle, WA",
    subscription: "Premium"
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
    subscription: "Premium"
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
    subscription: "Premium"
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
    subscription: "Free"
  },
  {
    name: "Matthew Walker",
    email: "matthew.walker@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1302",
    location: "El Paso, TX",
    subscription: "Free"
  },
  {
    name: "Jessica Hall",
    email: "jessica.hall@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1303",
    location: "Nashville, TN",
    subscription: "Basic"
  },
  {
    name: "Andrew Allen",
    email: "andrew.allen@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1304",
    location: "Detroit, MI",
    subscription: "Premium"
  }
]

export const seedDatabase = async () => {
  const { createUser } = await import('./firestore')
  
  console.log('Starting database seeding...')
  
  for (const userData of sampleUsers) {
    try {
      await createUser(userData)
      console.log(`Created user: ${userData.name}`)
    } catch (error) {
      console.error(`Failed to create user ${userData.name}:`, error)
    }
  }
  
  console.log('Database seeding completed!')
}
