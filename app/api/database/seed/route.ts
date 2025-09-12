import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

// Enhanced sample users data with all fields
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
    status: "Active",
    securityLevel: "Maximum",
    department: "Executive",
    performance: "Excellent"
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
    status: "Active",
    securityLevel: "Maximum",
    department: "Executive",
    performance: "Excellent"
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
    status: "Inactive",
    securityLevel: "Maximum",
    department: "Executive",
    performance: "Good"
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
    status: "Active",
    securityLevel: "High",
    department: "Administration",
    performance: "Very Good"
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
    status: "Active",
    securityLevel: "High",
    department: "Administration",
    performance: "Good"
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
    department: "Customer Support",
    subscription: "Basic",
    status: "Active",
    ticketsResolved: 156,
    avgResponseTime: "2.5 hours",
    performance: "Very Good",
    securityLevel: "Medium"
  },
  {
    name: "Lisa Davis",
    email: "lisa.davis@example.com",
    role: "Support",
    category: "Staff",
    subcategory: "Support",
    phone: "+1-555-0302",
    location: "San Antonio, TX",
    department: "Customer Support",
    subscription: "Basic",
    status: "Active",
    ticketsResolved: 203,
    avgResponseTime: "1.8 hours",
    performance: "Excellent",
    securityLevel: "Medium"
  },
  {
    name: "Alex Thompson",
    email: "alex.thompson@example.com",
    role: "Support",
    category: "Staff",
    subcategory: "Support",
    phone: "+1-555-0303",
    location: "Denver, CO",
    department: "Technical Support",
    subscription: "Basic",
    status: "Active",
    ticketsResolved: 89,
    avgResponseTime: "3.2 hours",
    performance: "Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Very Good",
    securityLevel: "High"
  },
  {
    name: "Jennifer Kim",
    email: "jennifer.kim@example.com",
    role: "Key Manager",
    category: "Staff",
    subcategory: "Key Manager",
    phone: "+1-555-0402",
    location: "Portland, OR",
    department: "Key Accounts",
    subscription: "Premium",
    status: "Active",
    performance: "Excellent",
    securityLevel: "High"
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
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
  },
  {
    name: "Dr. Thomas Anderson",
    email: "thomas.anderson@example.com",
    role: "Research",
    category: "Staff",
    subcategory: "Research",
    phone: "+1-555-0502",
    location: "Boston, MA",
    department: "R&D",
    subscription: "Premium",
    status: "Active",
    performance: "Excellent",
    securityLevel: "High"
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
    status: "Active",
    performance: "Good",
    securityLevel: "Low"
  },
  {
    name: "Sophie Martinez",
    email: "sophie.martinez@example.com",
    role: "Media",
    category: "Staff",
    subcategory: "Media",
    phone: "+1-555-0602",
    location: "Miami, FL",
    department: "Content Creation",
    subscription: "Basic",
    status: "Active",
    performance: "Very Good",
    securityLevel: "Low"
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
    status: "Active",
    performance: "Excellent",
    securityLevel: "Medium"
  },
  {
    name: "Brian Lee",
    email: "brian.lee@example.com",
    role: "Sales",
    category: "Staff",
    subcategory: "Sales",
    phone: "+1-555-0702",
    location: "Atlanta, GA",
    department: "Sales",
    subscription: "Premium",
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Good",
    securityLevel: "Low"
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
    status: "Active",
    performance: "Very Good",
    securityLevel: "Low"
  },
  {
    name: "Carlos Gonzalez",
    email: "carlos.gonzalez@example.com",
    role: "Supplier",
    category: "Partner",
    subcategory: "Supplier",
    phone: "+1-555-0803",
    location: "Phoenix, AZ",
    subscription: "Premium",
    status: "Active",
    performance: "Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Good",
    securityLevel: "Low"
  },
  {
    name: "Amanda Johnson",
    email: "amanda.johnson@example.com",
    role: "Service Provider",
    category: "Partner",
    subcategory: "Service Provider",
    phone: "+1-555-0902",
    location: "Nashville, TN",
    subscription: "Premium",
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Excellent",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
  },
  {
    name: "Rachel Green",
    email: "rachel.green@example.com",
    role: "Distributor",
    category: "Agent",
    subcategory: "Distributor",
    phone: "+1-555-1003",
    location: "Las Vegas, NV",
    subscription: "Basic",
    status: "Active",
    performance: "Good",
    securityLevel: "Low"
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
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
  },
  {
    name: "Steven Clark",
    email: "steven.clark@example.com",
    role: "Franchise",
    category: "Agent",
    subcategory: "Franchise",
    phone: "+1-555-1102",
    location: "Kansas City, MO",
    subscription: "Premium",
    status: "Active",
    performance: "Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "Excellent",
    securityLevel: "High"
  },
  {
    name: "Nicole Davis",
    email: "nicole.davis@example.com",
    role: "B2B",
    category: "Agent",
    subcategory: "B2B",
    phone: "+1-555-1202",
    location: "Baltimore, MD",
    subscription: "Premium",
    status: "Active",
    performance: "Very Good",
    securityLevel: "Medium"
  },
  {
    name: "Mark Wilson",
    email: "mark.wilson@example.com",
    role: "B2B",
    category: "Agent",
    subcategory: "B2B",
    phone: "+1-555-1203",
    location: "Richmond, VA",
    subscription: "Basic",
    status: "Active",
    performance: "Good",
    securityLevel: "Medium"
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
    status: "Active",
    performance: "N/A",
    securityLevel: "Basic"
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
    status: "Active",
    performance: "N/A",
    securityLevel: "Basic"
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
    status: "Active",
    performance: "N/A",
    securityLevel: "Basic"
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
    status: "Active",
    performance: "N/A",
    securityLevel: "Basic"
  },
  {
    name: "Taylor Brown",
    email: "taylor.brown@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1305",
    location: "Portland, OR",
    subscription: "Free",
    status: "Inactive",
    performance: "N/A",
    securityLevel: "Basic"
  },
  {
    name: "Jordan Smith",
    email: "jordan.smith@example.com",
    role: "User",
    category: "Users",
    subcategory: "publicuser",
    phone: "+1-555-1306",
    location: "Milwaukee, WI",
    subscription: "Basic",
    status: "Active",
    performance: "N/A",
    securityLevel: "Basic"
  }
]

interface SeedResult {
  success: boolean
  name: string
  id?: string
  error?: string
}

interface SeedResponse {
  message: string
  results: SeedResult[]
  successCount: number
  failureCount: number
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting comprehensive database seeding...')
    
    const results: SeedResult[] = []
    
    for (const userData of sampleUsers) {
      try {
        const now = Timestamp.now()
        const docRef = await addDoc(collection(db, 'users'), {
          ...userData,
          createdAt: now,
          updatedAt: now,
          lastLogin: null
        })
        
        results.push({
          success: true,
          name: userData.name,
          id: docRef.id
        })
        
        console.log(`✓ Created user: ${userData.name} (${userData.role}) - ID: ${docRef.id}`)
      } catch (error) {
        console.error(`✗ Failed to create user ${userData.name}:`, error)
        results.push({
          success: false,
          name: userData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    console.log(`Database seeding completed: ${successCount} successful, ${failureCount} failed`)
    
    const response: SeedResponse = {
      message: `Database initialization completed! Successfully created ${successCount} users across all roles and categories. ${failureCount > 0 ? `${failureCount} users failed to create.` : ''}`,
      results,
      successCount,
      failureCount,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Database seeding error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}