-- SUPABASE DATABASE SCHEMA FOR EKABA KNOWLEDGE BASE ASSISTANT
-- Copy and paste this script into your Supabase SQL Editor to initialize the database tables.

-- =========================================================================
-- 1. DROP EXISTING TABLES (Safeguarded Clean Slate)
-- =========================================================================
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS citations CASCADE;
DROP TABLE IF EXISTS query_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS pending_approvals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- USERS TABLE (Stores profile information and credentials for SSO login per company)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Employee', 'Manager', 'HR Officer', 'IT Administrator', 'Owner')),
    avatar TEXT,
    password TEXT NOT NULL DEFAULT 'Password@123',
    domain TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT 'ekaba',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company, email)
);

-- DOCUMENTS TABLE (Stores enterprise documents and policies for RAG semantic search)
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'System Admin',
    date_uploaded DATE NOT NULL DEFAULT CURRENT_DATE,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'txt')),
    size TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- QUERY LOGS TABLE (Stores RAG audit trails and search query history)
CREATE TABLE query_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed'))
);

-- CITATIONS TABLE (Stores individual document citation mapping for audit logs)
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id TEXT NOT NULL REFERENCES query_logs(id) ON DELETE CASCADE,
    source_doc TEXT NOT NULL,
    page TEXT,
    section TEXT,
    snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FEEDBACK TABLE (Stores user satisfaction reports on specific RAG queries)
CREATE TABLE feedback (
    query_id TEXT PRIMARY KEY REFERENCES query_logs(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('like', 'dislike')),
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PENDING APPROVALS TABLE (Manages first-time SSO profile clearance requests)
CREATE TABLE pending_approvals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    role TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. INDEXES FOR QUERY OPTIMIZATION
-- =========================================================================
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_query_logs_timestamp ON query_logs(timestamp DESC);
CREATE INDEX idx_citations_query_id ON citations(query_id);
CREATE INDEX idx_pending_approvals_status ON pending_approvals(status);

-- =========================================================================
-- 4. SEED DATA GENERATION
-- =========================================================================

-- INSERT SEED DOCUMENTS
INSERT INTO documents (id, name, category, content, uploaded_by, date_uploaded, file_type, size) VALUES
('doc-1', 'Employee Handbook 2026', 'HR Policies', 'Employee Handbook Section 4.2 - Leave Approval Process:
The leave approval process requires:
1. Submit request through HRMS.
2. Manager approval.
3. HR verification.
Ensure requests are submitted at least 10 business days before the planned leave date.

Employee Handbook Section 5.1 - Travel Reimbursement Policy:
Travel reimbursements must be submitted within 30 days of travel completion. Economy class flights are covered by default; business class tickets are only permitted for flights exceeding 8 hours and require VP approval. Meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). Itemized receipts are required for all expenses exceeding $25.

Employee Handbook Section 3.3 - Hybrid & Remote Work Guidelines:
Employees are eligible for hybrid work after the standard 3-month probation period. Remote schedules require coordination and formal agreement with the respective department head. Core hours when all employees must be reachable are 10:00 AM to 4:00 PM. High-speed home internet is required, and the company provides a remote-work equipment stipend of $500.', 'Admin System', '2026-01-10', 'txt', '12 KB'),

('doc-2', 'IT Security & Access Control Guidelines', 'IT & Compliance', 'IT Security Section 2.1 - Single Sign-On (SSO) & Passwords:
All employee accounts must utilize corporate Single Sign-On (SSO) integrated exclusively via Google Workspace or Active Directory. Passwords for individual applications must contain at least 14 characters and combine uppercase letters, lowercase letters, numbers, and special symbols. Clear text passwords are strictly forbidden.

IT Security Section 2.5 - Multi-Factor Authentication (MFA):
Multi-Factor Authentication (MFA) must be active for all remote corporate network logins. Authenticator apps (e.g. Google Authenticator) or security keys are the preferred MFA targets. Text message (SMS) OTPs are discouraged and must only be used as a fallback mechanism.

IT Security Section 3.1 - Data Encryption Standards:
All enterprise and client data must be encrypted at rest using AES-256 and in transit using TLS 1.3 to adhere to security benchmarks and fully conform to GDPR, ISO 27001, and SOC 2 requirements. Any database backups must be encrypted separately.', 'IT Sec Team', '2026-02-15', 'txt', '8 KB'),

('doc-3', 'Operations Manual', 'Operations', 'Operations Section 1.4 - Workflow Documentation:
All departmental workflows must be documented directly in the central Wiki. Annually, workflows are audited and reviewed by the Operations team to reduce duplicate work and identify bottlenecks.

Operations Section 2.2 - Expense & Purchase Approvals:
Purchases under $1,000 can be approved by the Team Manager. Purchases between $1,000 and $10,000 require Department Head sign-off. Purchases exceeding $10,000 require CFO authorization. All standard purchase requests must accompany three competitive supplier quotes.', 'Ops Department', '2026-03-01', 'txt', '15 KB');


-- INSERT DEFAULT CORPORATE USERS (EKABA)
INSERT INTO users (id, name, email, role, avatar, password, domain, company) VALUES
('u-pranav-jain', 'Pranav Jain', 'jainpranav1707@gmail.com', 'Owner', 'PJ', 'Pj@17072006', 'jainpranav1707@gmail.com', 'ekaba'),
('u-alice-smith', 'Alice Smith', 'alice.smith@ekaba.com', 'Employee', 'AS', 'Password@123', 'ekaba.com', 'ekaba'),
('u-john-doe', 'John Doe', 'john.doe@ekaba.com', 'Manager', 'JD', 'Password@123', 'ekaba.com', 'ekaba'),
('u-sarah-connor', 'Sarah Connor', 'sarah.connor@ekaba.com', 'HR Officer', 'SC', 'Password@123', 'ekaba.com', 'ekaba'),
('u-dave-miller', 'Dave Miller', 'dave.miller@ekaba.com', 'IT Administrator', 'DM', 'Password@123', 'ekaba.com', 'ekaba'),
('u-pranav-jain-internal', 'Pranav Jain', 'jainpranav1707@gmail.com', 'Owner', 'PJ', 'Pj@17072006', 'jainpranav1707@gmail.com', 'ekaba internal');

-- INSERT DEFAULT CORPORATE USERS (GOOGLE)
INSERT INTO users (id, name, email, role, avatar, password, domain, company) VALUES
('u-sundar-pichai', 'Sundar Pichai', 'sundar.pichai@google.com', 'Owner', 'SP', 'GoogleOwner@2026', 'google.com', 'google'),
('u-larry-page', 'Larry Page', 'larry.page@google.com', 'Employee', 'LP', 'GoogleEmp@2026', 'google.com', 'google'),
('u-sergey-brin', 'Sergey Brin', 'sergey.brin@google.com', 'Manager', 'SB', 'GoogleMgr@2026', 'google.com', 'google'),
('u-ruth-porat', 'Ruth Porat', 'ruth.porat@google.com', 'HR Officer', 'RP', 'GoogleHR@2026', 'google.com', 'google'),
('u-jeff-dean', 'Jeff Dean', 'jeff.dean@google.com', 'IT Administrator', 'JD', 'GoogleIT@2026', 'google.com', 'google');

-- INSERT DEFAULT CORPORATE USERS (ACME CORP)
INSERT INTO users (id, name, email, role, avatar, password, domain, company) VALUES
('u-wile-e-coyote', 'Wile E. Coyote', 'wile.e@acme.com', 'Owner', 'WC', 'AcmeOwner@2026', 'acme.com', 'acme corp'),
('u-road-runner', 'Road Runner', 'road.runner@acme.com', 'Employee', 'RR', 'AcmeEmp@2026', 'acme.com', 'acme corp'),
('u-bugs-bunny', 'Bugs Bunny', 'bugs.bunny@acme.com', 'Manager', 'BB', 'AcmeMgr@2026', 'acme.com', 'acme corp'),
('u-daffy-duck', 'Daffy Duck', 'daffy.duck@acme.com', 'HR Officer', 'DD', 'AcmeHR@2026', 'acme.com', 'acme corp'),
('u-elmer-fudd', 'Elmer Fudd', 'elmer.fudd@acme.com', 'IT Administrator', 'EF', 'AcmeIT@2026', 'acme.com', 'acme corp');

-- INSERT DEFAULT CORPORATE USERS (MICROSOFT)
INSERT INTO users (id, name, email, role, avatar, password, domain, company) VALUES
('u-satya-nadella', 'Satya Nadella', 'satya.nadella@microsoft.com', 'Owner', 'SN', 'MsftOwner@2026', 'microsoft.com', 'microsoft'),
('u-bill-gates', 'Bill Gates', 'bill.gates@microsoft.com', 'Employee', 'BG', 'MsftEmp@2026', 'microsoft.com', 'microsoft'),
('u-paul-allen', 'Paul Allen', 'paul.allen@microsoft.com', 'Manager', 'PA', 'MsftMgr@2026', 'microsoft.com', 'microsoft'),
('u-steve-ballmer', 'Steve Ballmer', 'steve.ballmer@microsoft.com', 'HR Officer', 'SB', 'MsftHR@2026', 'microsoft.com', 'microsoft'),
('u-kevin-scott', 'Kevin Scott', 'kevin.scott@microsoft.com', 'IT Administrator', 'KS', 'MsftIT@2026', 'microsoft.com', 'microsoft');

-- INSERT DEFAULT CORPORATE USERS (APPLE)
INSERT INTO users (id, name, email, role, avatar, password, domain, company) VALUES
('u-tim-cook', 'Tim Cook', 'tim.cook@apple.com', 'Owner', 'TC', 'AppleOwner@2026', 'apple.com', 'apple'),
('u-steve-jobs', 'Steve Jobs', 'steve.jobs@apple.com', 'Employee', 'SJ', 'AppleEmp@2026', 'apple.com', 'apple'),
('u-steve-wozniak', 'Steve Wozniak', 'steve.wozniak@apple.com', 'Manager', 'SW', 'AppleMgr@2026', 'apple.com', 'apple'),
('u-craig-federighi', 'Craig Federighi', 'craig.federighi@apple.com', 'HR Officer', 'CF', 'AppleHR@2026', 'apple.com', 'apple'),
('u-phil-schiller', 'Phil Schiller', 'phil.schiller@apple.com', 'IT Administrator', 'PS', 'AppleIT@2026', 'apple.com', 'apple');


-- INSERT INITIAL QUERY LOGS FOR HISTORIC REPORTING
INSERT INTO query_logs (id, user_id, user_name, user_role, query_text, response_text, timestamp, status) VALUES
('q-1', 'u-1', 'Pranav Jain', 'IT Administrator', 'What is the leave approval process for employees?', 'According to Employee Handbook Section 4.2, the leave approval process requires: 1. Submit request through HRMS. 2. Manager approval. 3. HR verification. Requests should be submitted at least 10 business days in advance.', '2026-06-14 10:30:00+00', 'success'),
('q-2', 'u-2', 'Alice Smith', 'Employee', 'How do I get reimbursed for travel meals?', 'Based on the Employee Handbook Section 5.1, meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). You must submit travel reimbursement requests within 30 days of travel completion, and itemized receipts are required for all expenses higher than $25.', '2026-06-14 14:15:00+00', 'success'),
('q-3', 'u-3', 'John Doe', 'Manager', 'What are the encryption standards for GDPR compliance?', 'According to IT Security Section 3.1, all enterprise and client data must be encrypted at rest utilizing AES-256 and in transit using TLS 1.3 to meet GDPR compliance, ISO 27001, and SOC 2 requirements.', '2026-06-14 16:45:00+00', 'success');

-- INSERT CITATIONS
INSERT INTO citations (query_id, source_doc, section, snippet) VALUES
('q-1', 'Employee Handbook 2026', 'Section 4.2 - Leave Approval Process', 'The leave approval process requires: 1. Submit request through HRMS. 2. Manager approval. 3. HR verification.'),
('q-2', 'Employee Handbook 2026', 'Section 5.1 - Travel Reimbursement Policy', 'Meal allowances are capped at a maximum of $75 per day ($20 breakfast, $25 lunch, $30 dinner). Itemized receipts are required for all expenses exceeding $25.'),
('q-3', 'IT Security & Access Control Guidelines', 'Section 3.1 - Data Encryption Standards', 'All enterprise and client data must be encrypted at rest using AES-256 and in transit using TLS 1.3 to adhere to security benchmarks and fully conform to GDPR, ISO 27001, and SOC 2');

-- INSERT FEEDBACK
INSERT INTO feedback (query_id, rating, comments, timestamp) VALUES
('q-1', 'like', NULL, '2026-06-14 10:31:00+00'),
('q-2', 'like', 'Precise answer. Thanks!', '2026-06-14 14:16:00+00');
