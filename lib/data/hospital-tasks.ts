/**
 * Hospital Work Task Categories and Workflows
 * Comprehensive list of permit-related tasks for Sodo Hospital
 */

export interface TaskStep {
  id: string
  title: string
  description?: string
}

export interface DocumentItem {
  id: string
  name: string
  required: boolean
  notes?: string
}

export interface TaskWorkflow {
  id: string
  category: string
  subcategory?: "NEW" | "RENEWAL" | "TEMPORARY" | "RETURN" | "OTHER"
  title: string
  description: string
  steps: TaskStep[]
  documents: DocumentItem[]
}

export interface TaskCategory {
  id: string
  name: string
  nameAmharic?: string
  icon: string
  workflows: TaskWorkflow[]
}

// ============================================
// HOSPITAL TASK CATEGORIES
// ============================================

export const hospitalTaskCategories: TaskCategory[] = [
  // --------------------------------------------
  // 1. MOH LICENSING
  // --------------------------------------------
  {
    id: "moh-licensing",
    name: "MOH Licensing",
    nameAmharic: "የጤና ሠራተኛ ፈቃድ",
    icon: "Stethoscope",
    workflows: [
      // Permanent/New
      {
        id: "moh-permanent-new",
        category: "moh-licensing",
        subcategory: "NEW",
        title: "Permanent/New License Application",
        description: "Application for new permanent health professional license",
        steps: [
          { id: "moh-new-1", title: "Document Preparation", description: "Collect and authenticate all academic documents and letters" },
          { id: "moh-new-2", title: "Payment", description: "Process payment of 105 USD" },
          { id: "moh-new-3", title: "Submit Application", description: "Submit documents to MOH" },
        ],
        documents: [
          { id: "moh-new-doc-1", name: "All Authenticated Academic Documents", required: true },
          { id: "moh-new-doc-2", name: "Passport Size Picture", required: true },
          { id: "moh-new-doc-3", name: "Passport Copy", required: true },
          { id: "moh-new-doc-4", name: "Official Letter from Hiring Organization", required: true },
          { id: "moh-new-doc-5", name: "Professional License", required: true },
          { id: "moh-new-doc-6", name: "Health Certificate", required: true },
          { id: "moh-new-doc-7", name: "Equivalence Letter from ETA", required: true },
          { id: "moh-new-doc-8", name: "Letter of Good Standing", required: true },
          { id: "moh-new-doc-9", name: "Payment Receipt (105 USD)", required: true },
        ],
      },
      // Temporary
      {
        id: "moh-temporary",
        category: "moh-licensing",
        subcategory: "TEMPORARY",
        title: "Temporary License Application",
        description: "Application for temporary health professional license",
        steps: [
          { id: "moh-temp-1", title: "Document Preparation", description: "Collect all required documents" },
          { id: "moh-temp-2", title: "Submit Application", description: "Submit documents to MOH" },
        ],
        documents: [
          { id: "moh-temp-doc-1", name: "Official Letter from Hiring Organization", required: true },
          { id: "moh-temp-doc-2", name: "All Academic Documents", required: true },
          { id: "moh-temp-doc-3", name: "Health Certificate", required: true },
          { id: "moh-temp-doc-4", name: "Passport Size Picture", required: true },
          { id: "moh-temp-doc-5", name: "Passport Copy", required: true },
          { id: "moh-temp-doc-6", name: "Professional License", required: true },
          { id: "moh-temp-doc-7", name: "Letter of Good Standing", required: true },
          { id: "moh-temp-doc-8", name: "Company Renewed License", required: true },
        ],
      },
      // Renewal
      {
        id: "moh-renewal",
        category: "moh-licensing",
        subcategory: "RENEWAL",
        title: "License Renewal",
        description: "Renewal of existing health professional license",
        steps: [
          { id: "moh-ren-1", title: "Document Preparation", description: "Collect renewal documents including CPD" },
          { id: "moh-ren-2", title: "Payment", description: "Process payment of 52.5 USD" },
          { id: "moh-ren-3", title: "Submit Renewal", description: "Submit renewal application" },
        ],
        documents: [
          { id: "moh-ren-doc-1", name: "Letter from Hiring Organization", required: true },
          { id: "moh-ren-doc-2", name: "Renewed License of Soddo", required: true },
          { id: "moh-ren-doc-3", name: "Previous License", required: true },
          { id: "moh-ren-doc-4", name: "Work Experience", required: true },
          { id: "moh-ren-doc-5", name: "CPD Certificate", required: true },
          { id: "moh-ren-doc-6", name: "Payment Receipt (52.5 USD)", required: true },
        ],
      },
      // Return Expired
      {
        id: "moh-return-expired",
        category: "moh-licensing",
        subcategory: "RETURN",
        title: "Return Expired License",
        description: "Process for returning an expired license",
        steps: [
          { id: "moh-ret-1", title: "Document Preparation", description: "Prepare return documents" },
          { id: "moh-ret-2", title: "Submit Return", description: "Submit expired license to MOH" },
        ],
        documents: [
          { id: "moh-ret-doc-1", name: "Letter from Hiring Organization", required: true },
          { id: "moh-ret-doc-2", name: "Original Previous License", required: true },
        ],
      },
    ],
  },
  // --------------------------------------------
  // 2. CUSTOMS
  // --------------------------------------------
  {
    id: "customs",
    name: "Customs",
    nameAmharic: "ጉምሩክ",
    icon: "Truck",
    workflows: [
      // Pre Import Permit (PIP)
      {
        id: "customs-pip",
        category: "customs",
        subcategory: "NEW",
        title: "Pre Import Permit (PIP)",
        description: "Application for EFDA Pre Import Permit",
        steps: [
          { id: "pip-1", title: "Document Collection", description: "Collect support letters and invoices" },
          { id: "pip-2", title: "Submit Application", description: "Submit PIP application" },
        ],
        documents: [
          { id: "pip-doc-1", name: "Support Letter from Region", required: true },
          { id: "pip-doc-2", name: "Official Letter", required: true },
          { id: "pip-doc-3", name: "Proforma Invoice", required: true },
          { id: "pip-doc-4", name: "Donation Certificate", required: false, notes: "If applicable" },
          { id: "pip-doc-5", name: "Certificate of Origin (COO)", required: true },
          { id: "pip-doc-6", name: "COC (Soddo)", required: true },
          { id: "pip-doc-7", name: "COC", required: true },
        ],
      },
      // Ethiopia Single Window
      {
        id: "customs-esw",
        category: "customs",
        subcategory: "OTHER",
        title: "Ethiopia Single Window (ESW)",
        description: "Customs clearance via Ethiopia Single Window",
        steps: [
          { id: "esw-1", title: "Document Upload", description: "Upload required documents to ESW portal" },
          { id: "esw-2", title: "Clearance Processing", description: "Monitor status until cleared" },
        ],
        documents: [
          { id: "esw-doc-1", name: "PIP Certificate", required: true },
          { id: "esw-doc-2", name: "Commercial Invoice", required: true },
          { id: "esw-doc-3", name: "Packing List", required: true },
          { id: "esw-doc-4", name: "Donation Certificate", required: false, notes: "If applicable" },
          { id: "esw-doc-5", name: "AWB (Air Waybill) / COO", required: true },
          { id: "esw-doc-6", name: "GMP Certificate", required: true },
        ],
      },
    ],
  },

  // --------------------------------------------
  // 3. WORK PERMIT
  // --------------------------------------------
  {
    id: "work-permit",
    name: "Work Permit",
    nameAmharic: "የስራ ፈቃድ",
    icon: "Briefcase",
    workflows: [
      // NEW Work Permit
      {
        id: "work-permit-new",
        category: "work-permit",
        subcategory: "NEW",
        title: "New Work Permit Application",
        description: "Process for obtaining a new work permit for foreign employees",
        steps: [
          { id: "wp-new-1", title: "Support Letter", description: "Obtain support letter from relevant authorities" },
          { id: "wp-new-2", title: "Document Arrangement", description: "Organize and prepare all required documents" },
          { id: "wp-new-3", title: "Apply Online", description: "Submit application through online portal" },
          { id: "wp-new-4", title: "Submit Document", description: "Submit physical documents to immigration office" },
          { id: "wp-new-5", title: "Work Permit", description: "Collect Work Permit" },
        ],
        documents: [
          { id: "wp-doc-1", name: "Application Letter", required: true },
          { id: "wp-doc-2", name: "Visa (visa and entry date on passport)", required: true },
          { id: "wp-doc-3", name: "Educational Document", required: true },
          { id: "wp-doc-4", name: "Contract Employee Agreement", required: true },
          { id: "wp-doc-5", name: "Support Letter (South Region and MOH)", required: true },
          { id: "wp-doc-6", name: "Delegation and ID (Kebele & Work)", required: true },
          { id: "wp-doc-7", name: "Passport", required: true },
          { id: "wp-doc-8", name: "Photo 2pcs", required: true },
          { id: "wp-doc-9", name: "Business License", required: true },
          { id: "wp-doc-10", name: "COC", required: true },
          { id: "wp-doc-11", name: "Business Registration", required: true },
          { id: "wp-doc-12", name: "TIN Number", required: true },
        ],
      },
      // RENEWAL Work Permit
      {
        id: "work-permit-renewal",
        category: "work-permit",
        subcategory: "RENEWAL",
        title: "Work Permit Renewal",
        description: "Process for renewing an existing work permit",
        steps: [
          { id: "wp-ren-1", title: "Support Letter", description: "Obtain renewal support letter" },
          { id: "wp-ren-2", title: "Document Arrangement", description: "Organize renewal documents" },
          { id: "wp-ren-3", title: "Apply Online", description: "Submit renewal application online" },
          { id: "wp-ren-4", title: "Submit Document", description: "Submit documents for renewal processing" },
          { id: "wp-ren-5", title: "Work Permit", description: "Collect Renewed Work Permit" },
        ],
        documents: [
          { id: "wp-ren-doc-1", name: "Application Letter", required: true },
          { id: "wp-ren-doc-2", name: "Contract Employee Agreement", required: true },
          { id: "wp-ren-doc-3", name: "Support Letter (South Region and MOH)", required: true },
          { id: "wp-ren-doc-4", name: "Visa (Work Permit & Residence ID)", required: true },
          { id: "wp-ren-doc-5", name: "Passport", required: true },
          { id: "wp-ren-doc-6", name: "Business License", required: true },
          { id: "wp-ren-doc-7", name: "COC", required: true },
          { id: "wp-ren-doc-8", name: "Business Registration", required: true },
          { id: "wp-ren-doc-9", name: "TIN Number", required: true },
        ],
      },
    ],
  },

  // --------------------------------------------
  // 4. RESIDENCE ID
  // --------------------------------------------
  {
    id: "residence-id",
    name: "Residence ID",
    nameAmharic: "የመኖሪያ መታወቂያ",
    icon: "CreditCard",
    workflows: [
      // NEW Residence ID
      {
        id: "residence-id-new",
        category: "residence-id",
        subcategory: "NEW",
        title: "New Residence ID Application",
        description: "Process for obtaining a new residence ID for foreign employees",
        steps: [
          { id: "res-new-1", title: "Support Letter", description: "Obtain support letter from authorities" },
          { id: "res-new-2", title: "Document Arrangement", description: "Prepare all required documents" },
          { id: "res-new-3", title: "Submit Document AND Payment", description: "Submit documents and pay fees" },
          { id: "res-new-4", title: "Pick ID", description: "Collect residence ID after processing" },
        ],
        documents: [
          { id: "res-doc-1", name: "Electronic Visa", required: true },
          { id: "res-doc-2", name: "Entry Date from Passport", required: true },
          { id: "res-doc-3", name: "Photo with Immigration Form", required: true },
          { id: "res-doc-4", name: "Official Letter", required: true },
          { id: "res-doc-5", name: "Support Letter", required: true },
          { id: "res-doc-6", name: "Work Permit", required: true },
          { id: "res-doc-7", name: "Passport", required: true },
          { id: "res-doc-8", name: "Photo", required: true },
          { id: "res-doc-9", name: "CEO Passport", required: true },
          { id: "res-doc-10", name: "Business License", required: true },
          { id: "res-doc-11", name: "COC", required: true },
          { id: "res-doc-12", name: "Business Registration", required: true },
          { id: "res-doc-13", name: "TIN Number", required: true },
          { id: "res-doc-14", name: "Delegation & ID (Kebele & Work)", required: true },
        ],
      },
      // NEW Residence ID for Dependents (Wife & Child)
      {
        id: "residence-id-new-dependent",
        category: "residence-id",
        subcategory: "NEW",
        title: "New Residence ID for Wife & Child",
        description: "Process for obtaining residence ID for dependents (spouse and children)",
        steps: [
          { id: "res-dep-1", title: "Support Letter", description: "Obtain support letter for dependents" },
          { id: "res-dep-2", title: "Document Arrangement", description: "Prepare dependent documents" },
          { id: "res-dep-3", title: "Submit Document AND Payment", description: "Submit documents and pay fees" },
          { id: "res-dep-4", title: "Pick ID", description: "Collect residence IDs for dependents" },
        ],
        documents: [
          { id: "res-dep-doc-1", name: "Authenticated Birth Certificate", required: true, notes: "For children" },
          { id: "res-dep-doc-2", name: "Authenticated Marriage Certificate", required: true, notes: "For spouse" },
          { id: "res-dep-doc-3", name: "Copy of Work Permit", required: true },
          { id: "res-dep-doc-4", name: "Official Letter (listing names of wife and children)", required: true },
          { id: "res-dep-doc-5", name: "All Document Copies", required: true },
        ],
      },
      // RENEWAL Residence ID
      {
        id: "residence-id-renewal",
        category: "residence-id",
        subcategory: "RENEWAL",
        title: "Residence ID Renewal",
        description: "Process for renewing an existing residence ID",
        steps: [
          { id: "res-ren-1", title: "Support Letter", description: "Obtain renewal support letter" },
          { id: "res-ren-2", title: "Document Arrangement", description: "Organize renewal documents" },
          { id: "res-ren-3", title: "Submit Document AND Payment", description: "Submit documents and pay renewal fees" },
          { id: "res-ren-4", title: "Pick ID", description: "Collect renewed residence ID" },
        ],
        documents: [
          { id: "res-ren-doc-1", name: "ICS Form (Immigration Citizenship)", required: true },
          { id: "res-ren-doc-2", name: "Official Letter from Soddo", required: true },
          { id: "res-ren-doc-3", name: "Current Photo for Children", required: false, notes: "Required for children" },
          { id: "res-ren-doc-4", name: "Passport Copy", required: true },
          { id: "res-ren-doc-5", name: "Residence ID", required: true },
          { id: "res-ren-doc-6", name: "Work Permit", required: true },
          { id: "res-ren-doc-7", name: "Support Letter from SNNP", required: true },
          { id: "res-ren-doc-8", name: "Marriage Certificate", required: false, notes: "For dependent spouse" },
          { id: "res-ren-doc-9", name: "Business License", required: true },
          { id: "res-ren-doc-10", name: "COC", required: true },
          { id: "res-ren-doc-11", name: "Business Registration", required: true },
          { id: "res-ren-doc-12", name: "TIN Number", required: true },
          { id: "res-ren-doc-13", name: "Delegation with ID (Kebele and Work)", required: true },
        ],
      },
      // RENEWAL Residence ID for Dependents
      {
        id: "residence-id-renewal-dependent",
        category: "residence-id",
        subcategory: "RENEWAL",
        title: "Renewal Residence ID for Dependents",
        description: "Renewal process for dependent residence IDs (kids, wife, or husband)",
        steps: [
          { id: "res-dep-ren-1", title: "Support Letter", description: "Obtain support letter for dependent renewal" },
          { id: "res-dep-ren-2", title: "Document Arrangement", description: "Prepare dependent renewal documents" },
          { id: "res-dep-ren-3", title: "Submit Document AND Payment", description: "Submit documents and pay fees" },
          { id: "res-dep-ren-4", title: "Pick ID", description: "Collect renewed dependent IDs" },
        ],
        documents: [
          { id: "res-dep-ren-doc-1", name: "ICS (Immigration Citizenship) Form", required: true },
          { id: "res-dep-ren-doc-2", name: "Current Photo for Children", required: true, notes: "Required for children" },
          { id: "res-dep-ren-doc-3", name: "Passport Copy", required: true },
          { id: "res-dep-ren-doc-4", name: "Residence ID", required: true },
          { id: "res-dep-ren-doc-5", name: "Work Permit", required: true },
          { id: "res-dep-ren-doc-6", name: "Renewed Residence ID", required: true },
          { id: "res-dep-ren-doc-7", name: "Birth Certificate (for kids)", required: false, notes: "For children" },
          { id: "res-dep-ren-doc-8", name: "Marriage Certificate (for spouse)", required: false, notes: "For wife or husband" },
          { id: "res-dep-ren-doc-9", name: "Business License", required: true },
          { id: "res-dep-ren-doc-10", name: "COC", required: true },
          { id: "res-dep-ren-doc-11", name: "Business Registration", required: true },
          { id: "res-dep-ren-doc-12", name: "TIN Number", required: true },
          { id: "res-dep-ren-doc-13", name: "Delegation with ID (Kebele and Work)", required: true },
        ],
      },
    ],
  },

  // --------------------------------------------
  // 5. BOLO AND INSURANCE (VEHICLE)
  // --------------------------------------------
  {
    id: "bolo-insurance",
    name: "Bolo and Insurance",
    nameAmharic: "ቦሎ እና ኢንሹራንስ",
    icon: "Car",
    workflows: [
      {
        id: "bolo-insurance-inspection",
        category: "bolo-insurance",
        subcategory: "NEW",
        title: "Bolo and Insurance Inspection",
        description: "Vehicle inspection, road fund, insurance, and transport documentation",
        steps: [
          { id: "bolo-1", title: "Inspection", description: "Vehicle inspection process" },
          { id: "bolo-2", title: "Road Fund", description: "Process road fund payment and documentation" },
          { id: "bolo-3", title: "Insurance", description: "Obtain and verify vehicle insurance" },
          { id: "bolo-4", title: "Road Transport", description: "Complete road transport requirements" },
        ],
        documents: [
          { id: "bolo-doc-1", name: "Libre (Vehicle Registration)", required: true },
          { id: "bolo-doc-2", name: "Inspection Result", required: true },
          { id: "bolo-doc-3", name: "Bank Slip", required: true },
          { id: "bolo-doc-4", name: "Delegation with ID", required: true },
          { id: "bolo-doc-5", name: "Bank Slip of Road Fund", required: true },
          { id: "bolo-doc-6", name: "Insurance", required: true },
          { id: "bolo-doc-7", name: "Road Fund", required: true },
        ],
      },
    ],
  },

  // --------------------------------------------
  // 6. COMPANY REGISTRATION
  // --------------------------------------------
  {
    id: "company-registration",
    name: "Company Registration",
    nameAmharic: "የድርጅት ምዝገባ",
    icon: "Building",
    workflows: [
      {
        id: "company-registration-new",
        category: "company-registration",
        subcategory: "NEW",
        title: "Company Registration",
        description: "Process for registering a new company or business",
        steps: [
          { id: "comp-1", title: "Document Preparation", description: "Prepare all company registration documents" },
          { id: "comp-2", title: "Apply Online", description: "Submit registration application online" },
          { id: "comp-3", title: "Approved the Registration", description: "Receive approval and finalize registration" },
        ],
        documents: [
          { id: "comp-doc-1", name: "Official Letter", required: true },
          { id: "comp-doc-2", name: "Business License", required: true },
          { id: "comp-doc-3", name: "COC", required: true },
          { id: "comp-doc-4", name: "Business Registration", required: true },
          { id: "comp-doc-5", name: "TIN Number", required: true },
          { id: "comp-doc-6", name: "Delegation & ID (Kebele & Work)", required: true },
        ],
      },
    ],
  },

  // --------------------------------------------
  // 7. GOV'T AFFAIRS
  // --------------------------------------------
  {
    id: "govt-affairs",
    name: "Gov't Affairs",
    nameAmharic: "የመንግስት ጉዳዮች",
    icon: "Landmark",
    workflows: [
      {
        id: "govt-investment",
        category: "govt-affairs",
        subcategory: "OTHER",
        title: "Investment Commission",
        description: "Investment commission relations",
        steps: [{ id: "govt-inv-1", title: "Process", description: "Handle Investment Commission requirements" }],
        documents: [],
      },
      {
        id: "govt-eta",
        category: "govt-affairs",
        subcategory: "OTHER",
        title: "ETA (Education & Training Authority)",
        description: "ETA relations and requirements",
        steps: [{ id: "govt-eta-1", title: "Process", description: "Handle ETA requirements" }],
        documents: [],
      },
      {
        id: "govt-paccs",
        category: "govt-affairs",
        subcategory: "OTHER",
        title: "PACCS (Charity/Residency)",
        description: "PACCS relations",
        steps: [{ id: "govt-paccs-1", title: "Process", description: "Handle PACCS requirements" }],
        documents: [],
      },
      {
        id: "govt-family-medicine",
        category: "govt-affairs",
        subcategory: "OTHER",
        title: "Family Medicine",
        description: "Family Medicine specialty licensing/regulations",
        steps: [{ id: "govt-fam-1", title: "Process", description: "Handle Family Medicine regulatory requirements" }],
        documents: [],
      },
    ],
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all task categories
 */
export function getAllCategories(): TaskCategory[] {
  return hospitalTaskCategories
}

/**
 * Get a category by ID
 */
export function getCategoryById(categoryId: string): TaskCategory | undefined {
  return hospitalTaskCategories.find((cat) => cat.id === categoryId)
}

/**
 * Get all workflows across all categories
 */
export function getAllWorkflows(): TaskWorkflow[] {
  return hospitalTaskCategories.flatMap((cat) => cat.workflows)
}

/**
 * Get a workflow by ID
 */
export function getWorkflowById(workflowId: string): TaskWorkflow | undefined {
  return getAllWorkflows().find((wf) => wf.id === workflowId)
}

/**
 * Get workflows by category ID
 */
export function getWorkflowsByCategory(categoryId: string): TaskWorkflow[] {
  const category = getCategoryById(categoryId)
  return category?.workflows || []
}

/**
 * Get workflows by subcategory (NEW, RENEWAL, etc)
 */
export function getWorkflowsBySubcategory(subcategory: string): TaskWorkflow[] {
  return getAllWorkflows().filter((wf) => wf.subcategory === subcategory)
}

/**
 * Get all required documents for a workflow
 */
export function getRequiredDocuments(workflowId: string): DocumentItem[] {
  const workflow = getWorkflowById(workflowId)
  return workflow?.documents.filter((doc) => doc.required) || []
}

/**
 * Calculate document checklist completion for a workflow
 */
export function calculateDocumentCompletion(
  workflowId: string,
  submittedDocIds: string[]
): { total: number; completed: number; percentage: number } {
  const workflow = getWorkflowById(workflowId)
  if (!workflow) return { total: 0, completed: 0, percentage: 0 }

  const requiredDocs = workflow.documents.filter((doc) => doc.required)
  const completed = requiredDocs.filter((doc) => submittedDocIds.includes(doc.id)).length

  return {
    total: requiredDocs.length,
    completed,
    percentage: requiredDocs.length > 0 ? Math.round((completed / requiredDocs.length) * 100) : 0,
  }
}

/**
 * Calculate step completion for a workflow
 */
export function calculateStepCompletion(
  workflowId: string,
  completedStepIds: string[]
): { total: number; completed: number; percentage: number } {
  const workflow = getWorkflowById(workflowId)
  if (!workflow) return { total: 0, completed: 0, percentage: 0 }

  const completed = workflow.steps.filter((step) => completedStepIds.includes(step.id)).length

  return {
    total: workflow.steps.length,
    completed,
    percentage: workflow.steps.length > 0 ? Math.round((completed / workflow.steps.length) * 100) : 0,
  }
}
