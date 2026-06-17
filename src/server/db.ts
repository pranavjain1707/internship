import { Document, QueryLog, User, UserRole, Citation } from "../types";
import fs from "fs";
import path from "path";

// In-memory Database State (Global to the server session)

export const documents: Document[] = [
  {
    id: "doc-1",
    name: "Employee Handbook 2026",
    category: "HR Policies",
    uploadedBy: "Admin System",
    dateUploaded: "2026-01-10",
    fileType: "txt",
    size: "12 KB",
    content: `Employee Handbook Section 4.2 - Leave Approval Process:
The leave approval process requires:
1. Submit request through HRMS.
2. Manager approval.
3. HR verification.
Ensure requests are submitted at least 10 business days before the planned leave date.

Employee Handbook Section 5.1 - Travel Reimbursement Policy:
Travel reimbursements must be submitted within 30 days of travel completion. Economy class flights are covered by default; business class tickets are only permitted for flights exceeding 8 hours and require VP approval. Meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). Itemized receipts are required for all expenses exceeding $25.

Employee Handbook Section 3.3 - Hybrid & Remote Work Guidelines:
Employees are eligible for hybrid work after the standard 3-month probation period. Remote schedules require coordination and formal agreement with the respective department head. Core hours when all employees must be reachable are 10:00 AM to 4:00 PM. High-speed home internet is required, and the company provides a remote-work equipment stipend of $500.`,
  },
  {
    id: "doc-2",
    name: "IT Security & Access Control Guidelines",
    category: "IT & Compliance",
    uploadedBy: "IT Sec Team",
    dateUploaded: "2026-02-15",
    fileType: "txt",
    size: "8 KB",
    content: `IT Security Section 2.1 - Single Sign-On (SSO) & Passwords:
All employee accounts must utilize corporate Single Sign-On (SSO) integrated exclusively via Google Workspace or Active Directory. Passwords for individual applications must contain at least 14 characters and combine uppercase letters, lowercase letters, numbers, and special symbols. Clear text passwords are strictly forbidden.

IT Security Section 2.5 - Multi-Factor Authentication (MFA):
Multi-Factor Authentication (MFA) must be active for all remote corporate network logins. Authenticator apps (e.g. Google Authenticator) or security keys are the preferred MFA targets. Text message (SMS) OTPs are discouraged and must only be used as a fallback mechanism.

IT Security Section 3.1 - Data Encryption Standards:
All enterprise and client data must be encrypted at rest using AES-256 and in transit using TLS 1.3 to adhere to security benchmarks and fully conform to GDPR, ISO 27001, and SOC 2 requirements. Any database backups must be encrypted separately.`,
  },
  {
    id: "doc-3",
    name: "Operations Manual",
    category: "Operations",
    uploadedBy: "Ops Department",
    dateUploaded: "2026-03-01",
    fileType: "txt",
    size: "15 KB",
    content: `Operations Section 1.4 - Workflow Documentation:
All departmental workflows must be documented directly in the central Wiki. Annually, workflows are audited and reviewed by the Operations team to reduce duplicate work and identify bottlenecks.

Operations Section 2.2 - Expense & Purchase Approvals:
Purchases under $1,000 can be approved by the Team Manager. Purchases between $1,000 and $10,000 require Department Head sign-off. Purchases exceeding $10,000 require CFO authorization. All standard purchase requests must accompany three competitive supplier quotes.`,
  },
];

export const queryLogs: QueryLog[] = [
  {
    id: "q-1",
    userId: "u-1",
    userName: "Pranav Jain",
    userRole: "IT Administrator",
    queryText: "What is the leave approval process for employees?",
    responseText:
      "According to Employee Handbook Section 4.2, the leave approval process requires: \n1. Submit request through HRMS.\n2. Manager approval.\n3. HR verification.\nRequests should be submitted at least 10 business days in advance.",
    citations: [
      {
        sourceDoc: "Employee Handbook 2026",
        section: "Section 4.2 - Leave Approval Process",
        snippet:
          "The leave approval process requires: 1. Submit request through HRMS. 2. Manager approval. 3. HR verification.",
      },
    ],
    timestamp: "2026-06-14T10:30:00Z",
    status: "success",
    feedback: {
      rating: "like",
    },
  },
  {
    id: "q-2",
    userId: "u-2",
    userName: "Alice Smith",
    userRole: "Employee",
    queryText: "How do I get reimbursed for travel meals?",
    responseText:
      "Based on the Employee Handbook Section 5.1, meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). You must submit travel reimbursement requests within 30 days of travel completion, and itemized receipts are required for all expenses higher than $25.",
    citations: [
      {
        sourceDoc: "Employee Handbook 2026",
        section: "Section 5.1 - Travel Reimbursement Policy",
        snippet:
          "Meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). Itemized receipts are required for all expenses exceeding $25.",
      },
    ],
    timestamp: "2026-06-14T14:15:00Z",
    status: "success",
    feedback: {
      rating: "like",
      comments: "Precise answer. Thanks!",
    },
  },
  {
    id: "q-3",
    userId: "u-3",
    userName: "John Doe",
    userRole: "Manager",
    queryText: "What are the encryption standards for GDPR compliance?",
    responseText:
      "According to IT Security Section 3.1, all enterprise and client data must be encrypted at rest utilizing AES-256 and in transit using TLS 1.3 to meet GDPR compliance, ISO 27001, and SOC 2 requirements.",
    citations: [
      {
        sourceDoc: "IT Security & Access Control Guidelines",
        section: "Section 3.1 - Data Encryption Standards",
        snippet:
          "All enterprise and client data must be encrypted at rest using AES-256 and in transit using TLS 1.3 to adhere to security benchmarks and fully conform to GDPR, ISO 27001, and SOC 2",
      },
    ],
    timestamp: "2026-06-14T16:45:00Z",
    status: "success",
  },
];

export const companyUsers: Record<string, User[]> = {
  "ekaba": [
    { id: "u-pranav-jain", name: "Pranav Jain", email: "jainpranav1707@gmail.com", role: "Owner", avatar: "PJ" },
    { id: "u-alice-smith", name: "Alice Smith", email: "alice.smith@ekaba.com", role: "Employee", avatar: "AS" },
    { id: "u-john-doe", name: "John Doe", email: "john.doe@ekaba.com", role: "Manager", avatar: "JD" },
    { id: "u-sarah-connor", name: "Sarah Connor", email: "sarah.connor@ekaba.com", role: "HR Officer", avatar: "SC" },
    { id: "u-dave-miller", name: "Dave Miller", email: "dave.miller@ekaba.com", role: "IT Administrator", avatar: "DM" }
  ],
  "ekaba internal": [
    { id: "u-pranav-jain", name: "Pranav Jain", email: "jainpranav1707@gmail.com", role: "Owner", avatar: "PJ" }
  ],
  "google": [
    { id: "u-sundar-pichai", name: "Sundar Pichai", email: "sundar.pichai@google.com", role: "Owner", avatar: "SP" },
    { id: "u-larry-page", name: "Larry Page", email: "larry.page@google.com", role: "Employee", avatar: "LP" },
    { id: "u-sergey-brin", name: "Sergey Brin", email: "sergey.brin@google.com", role: "Manager", avatar: "SB" },
    { id: "u-ruth-porat", name: "Ruth Porat", email: "ruth.porat@google.com", role: "HR Officer", avatar: "RP" },
    { id: "u-jeff-dean", name: "Jeff Dean", email: "jeff.dean@google.com", role: "IT Administrator", avatar: "JD" }
  ],
  "acme corp": [
    { id: "u-wile-e-coyote", name: "Wile E. Coyote", email: "wile.e@acme.com", role: "Owner", avatar: "WC" },
    { id: "u-road-runner", name: "Road Runner", email: "road.runner@acme.com", role: "Employee", avatar: "RR" },
    { id: "u-bugs-bunny", name: "Bugs Bunny", email: "bugs.bunny@acme.com", role: "Manager", avatar: "BB" },
    { id: "u-daffy-duck", name: "Daffy Duck", email: "daffy.duck@acme.com", role: "HR Officer", avatar: "DD" },
    { id: "u-elmer-fudd", name: "Elmer Fudd", email: "elmer.fudd@acme.com", role: "IT Administrator", avatar: "EF" }
  ],
  "microsoft": [
    { id: "u-satya-nadella", name: "Satya Nadella", email: "satya.nadella@microsoft.com", role: "Owner", avatar: "SN" },
    { id: "u-bill-gates", name: "Bill Gates", email: "bill.gates@microsoft.com", role: "Employee", avatar: "BG" },
    { id: "u-paul-allen", name: "Paul Allen", email: "paul.allen@microsoft.com", role: "Manager", avatar: "PA" },
    { id: "u-steve-ballmer", name: "Steve Ballmer", email: "steve.ballmer@microsoft.com", role: "HR Officer", avatar: "SB" },
    { id: "u-kevin-scott", name: "Kevin Scott", email: "kevin.scott@microsoft.com", role: "IT Administrator", avatar: "KS" }
  ],
  "apple": [
    { id: "u-tim-cook", name: "Tim Cook", email: "tim.cook@apple.com", role: "Owner", avatar: "TC" },
    { id: "u-steve-jobs", name: "Steve Jobs", email: "steve.jobs@apple.com", role: "Employee", avatar: "SJ" },
    { id: "u-steve-wozniak", name: "Steve Wozniak", email: "steve.wozniak@apple.com", role: "Manager", avatar: "SW" },
    { id: "u-craig-federighi", name: "Craig Federighi", email: "craig.federighi@apple.com", role: "HR Officer", avatar: "CF" },
    { id: "u-phil-schiller", name: "Phil Schiller", email: "phil.schiller@apple.com", role: "IT Administrator", avatar: "PS" }
  ]
};

export interface StoredUserCredentials {
  name: string;
  domain: string;
  password?: string;
  role: string;
}

export const companyUsersDb: Record<string, Record<string, StoredUserCredentials>> = {
  "ekaba": {
    "pranav jain": { name: "Pranav Jain", domain: "jainpranav1707@gmail.com", password: "Pj@17072006", role: "Owner" },
    "alice smith": { name: "Alice Smith", domain: "ekaba.com", password: "Password@123", role: "Employee" },
    "john doe": { name: "John Doe", domain: "ekaba.com", password: "Password@123", role: "Manager" },
    "sarah connor": { name: "Sarah Connor", domain: "ekaba.com", password: "Password@123", role: "HR Officer" },
    "dave miller": { name: "Dave Miller", domain: "ekaba.com", password: "Password@123", role: "IT Administrator" }
  },
  "ekaba internal": {
    "pranav jain": { name: "Pranav Jain", domain: "jainpranav1707@gmail.com", password: "Pj@17072006", role: "Owner" }
  },
  "google": {
    "sundar pichai": { name: "Sundar Pichai", domain: "google.com", password: "GoogleOwner@2026", role: "Owner" },
    "larry page": { name: "Larry Page", domain: "google.com", password: "GoogleEmp@2026", role: "Employee" },
    "sergey brin": { name: "Sergey Brin", domain: "google.com", password: "GoogleMgr@2026", role: "Manager" },
    "ruth porat": { name: "Ruth Porat", domain: "google.com", password: "GoogleHR@2026", role: "HR Officer" },
    "jeff dean": { name: "Jeff Dean", domain: "google.com", password: "GoogleIT@2026", role: "IT Administrator" }
  },
  "acme corp": {
    "wile e. coyote": { name: "Wile E. Coyote", domain: "acme.com", password: "AcmeOwner@2026", role: "Owner" },
    "road runner": { name: "Road Runner", domain: "acme.com", password: "AcmeEmp@2026", role: "Employee" },
    "bugs bunny": { name: "Bugs Bunny", domain: "acme.com", password: "AcmeMgr@2026", role: "Manager" },
    "daffy duck": { name: "Daffy Duck", domain: "acme.com", password: "AcmeHR@2026", role: "HR Officer" },
    "elmer fudd": { name: "Elmer Fudd", domain: "acme.com", password: "AcmeIT@2026", role: "IT Administrator" }
  },
  "microsoft": {
    "satya nadella": { name: "Satya Nadella", domain: "microsoft.com", password: "MsftOwner@2026", role: "Owner" },
    "bill gates": { name: "Bill Gates", domain: "microsoft.com", password: "MsftEmp@2026", role: "Employee" },
    "paul allen": { name: "Paul Allen", domain: "microsoft.com", password: "MsftMgr@2026", role: "Manager" },
    "steve ballmer": { name: "Steve Ballmer", domain: "microsoft.com", password: "MsftHR@2026", role: "HR Officer" },
    "kevin scott": { name: "Kevin Scott", domain: "microsoft.com", password: "MsftIT@2026", role: "IT Administrator" }
  },
  "apple": {
    "tim cook": { name: "Tim Cook", domain: "apple.com", password: "AppleOwner@2026", role: "Owner" },
    "steve jobs": { name: "Steve Jobs", domain: "apple.com", password: "AppleEmp@2026", role: "Employee" },
    "steve wozniak": { name: "Steve Wozniak", domain: "apple.com", password: "AppleMgr@2026", role: "Manager" },
    "craig federighi": { name: "Craig Federighi", domain: "apple.com", password: "AppleHR@2026", role: "HR Officer" },
    "phil schiller": { name: "Phil Schiller", domain: "apple.com", password: "AppleIT@2026", role: "IT Administrator" }
  }
};

const DB_FILE_PATH = path.resolve(process.cwd(), "db_users.json");

function loadDbFromFile() {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
      if (data.companyUsers && data.companyUsersDb) {
        // Clear defaults before copying saved state
        for (const k of Object.keys(companyUsers)) {
          delete companyUsers[k];
        }
        for (const k of Object.keys(companyUsersDb)) {
          delete companyUsersDb[k];
        }
        Object.assign(companyUsers, data.companyUsers);
        Object.assign(companyUsersDb, data.companyUsersDb);
      }
    } catch (e) {
      console.error("Failed to load users DB file, keeping defaults:", e);
    }
  }
}

export function persistDb() {
  try {
    fs.writeFileSync(
      DB_FILE_PATH,
      JSON.stringify({ companyUsers, companyUsersDb }, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("Failed to save users DB file:", e);
  }
}

// Load initial state if exists
loadDbFromFile();

// Export legacy globals for general compatibility
export const users: User[] = companyUsers["ekaba"];
export const usersDb: Record<string, StoredUserCredentials> = companyUsersDb["ekaba"];

export function getCompanyUsers(company: string): User[] {
  const key = company.toLowerCase().trim() || "ekaba";
  if (!companyUsers[key]) {
    companyUsers[key] = [];
    persistDb();
  }
  return companyUsers[key];
}

export function getCompanyUsersDb(company: string): Record<string, StoredUserCredentials> {
  const key = company.toLowerCase().trim() || "ekaba";
  if (!companyUsersDb[key]) {
    companyUsersDb[key] = {};
    persistDb();
  }
  return companyUsersDb[key];
}


// Simple helper to segment/chunk documents by Section
export interface TextChunk {
  docId: string;
  docName: string;
  section: string;
  content: string;
}

export function getDocumentChunks(): TextChunk[] {
  const chunks: TextChunk[] = [];
  for (const doc of documents) {
    // Attempt to segment by Section headers or standard paragraphs
    const sectionSplits = doc.content.split(
      /(?=Section \d+\.\d+|Operations Section|Employee Handbook Section|IT Security Section)/i,
    );
    for (const split of sectionSplits) {
      if (!split.trim()) continue;
      // Extract first line as Section header if possible
      const lines = split.trim().split("\n");
      const sectionName = lines[0].replace(/:$/, "").trim();
      chunks.push({
        docId: doc.id,
        docName: doc.name,
        section: sectionName,
        content: split.trim(),
      });
    }
  }
  return chunks;
}

// Full text TF-IDF equivalent relevance scorer for RAG
export function findRelevantChunks(query: string, maxResults = 3): TextChunk[] {
  const chunks = getDocumentChunks();
  const queryTerms = query
    .toLowerCase()
    .split(/[\s,?.!-]+/)
    .filter((t) => t.length > 2);

  if (queryTerms.length === 0) {
    return chunks.slice(0, maxResults);
  }

  const scoredChunks = chunks.map((chunk) => {
    let score = 0;
    const chunkText = (chunk.section + " " + chunk.content).toLowerCase();

    for (const term of queryTerms) {
      // Direct exact match weights heavily
      const occurrences = chunkText.split(term).length - 1;
      score += occurrences * 5;

      // Checking density or proximity of multiple exact terms
      if (chunkText.includes(term)) {
        score += 15;
      }
    }

    return { chunk, score };
  });

  // Sort and select top ones
  const filtered = scoredChunks
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.chunk);

  // Return top matching chunks. Fallback to first few if no keyword matched
  return filtered.length > 0 ? filtered.slice(0, maxResults) : chunks.slice(0, maxResults);
}
