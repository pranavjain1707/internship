import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client (never imported by client-side code).
// Reads env vars at call-time (not module init) so they are available
// when the server handler runs.

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error(
      "Supabase server config missing: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) not set.",
    );
  }

  return createClient(url, key);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SupabaseDocumentRow {
  id: string;
  name: string;
  category: string;
  content: string;
  file_path: string | null;
  uploaded_by: string;
  date_uploaded: string;
  file_type: string;
  size: string;
  created_at: string;
  company: string;
}

// ─── Save a document record to Supabase ──────────────────────────────────────

export async function saveDocumentToSupabase(params: {
  id: string;
  name: string;
  category: string;
  content: string;
  filePath: string;
  uploadedBy: string;
  dateUploaded: string;
  fileType: string;
  size: string;
  company?: string;
}): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Try with file_path first
  const rowWithFilePath = {
    id: params.id,
    name: params.name,
    category: params.category,
    content: params.content,
    file_path: params.filePath,
    uploaded_by: params.uploadedBy,
    date_uploaded: params.dateUploaded,
    file_type: params.fileType,
    size: params.size,
    company: params.company || "ekaba",
  };

  const { error } = await supabase.from("documents").upsert(rowWithFilePath);

  if (error) {
    // If file_path column doesn't exist yet, retry without it
    if (error.message.includes("file_path") && error.message.includes("schema")) {
      console.warn(
        "[supabase] file_path column not found, saving without it. Run: ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;",
      );
      const { file_path, ...rowWithoutFilePath } = rowWithFilePath;
      const { error: retryError } = await supabase.from("documents").upsert(rowWithoutFilePath);
      if (retryError) {
        throw new Error(`Supabase insert failed: ${retryError.message}`);
      }
      return;
    }
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

// ─── Fetch all documents from Supabase ───────────────────────────────────────

export async function fetchDocumentsFromSupabase(): Promise<SupabaseDocumentRow[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, name, category, content, file_path, uploaded_by, date_uploaded, file_type, size, created_at, company",
    )
    .order("created_at", { ascending: true });

  if (error) {
    // If file_path or company column doesn't exist, retry without it
    if (error.message.includes("file_path") || error.message.includes("company")) {
      console.warn("[supabase] column not found, fetching fallback columns. Run migrations.");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("documents")
        .select(
          "id, name, category, content, uploaded_by, date_uploaded, file_type, size, created_at",
        )
        .order("created_at", { ascending: true });

      if (fallbackError) {
        console.error("Failed to fetch documents from Supabase:", fallbackError.message);
        return [];
      }

      // Map rows to include file_path as null and company as default
      return ((fallbackData || []) as any[]).map((row) => ({
        ...row,
        file_path: null,
        company: "ekaba",
      })) as SupabaseDocumentRow[];
    }

    console.error("Failed to fetch documents from Supabase:", error.message);
    return [];
  }

  return ((data || []) as any[]).map((row) => ({
    ...row,
    company: row.company || "ekaba",
  })) as SupabaseDocumentRow[];
}

// ─── Fetch a single document path by ID ──────────────────────────────────────

export async function fetchDocumentPathById(docId: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", docId)
    .single();

  if (error || !data) {
    console.error(`Could not find file_path for doc ${docId}:`, error?.message);
    return null;
  }

  return (data as { file_path: string | null }).file_path;
}

// ─── Upload file content to Supabase Storage ─────────────────────────────────

const STORAGE_BUCKET = "documents";

async function ensureBucketExists(supabase: SupabaseClient): Promise<void> {
  // Try to get the bucket; if it doesn't exist, create it
  const { error: getError } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (getError) {
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    });
    if (createError && !createError.message.includes("already exists")) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`);
    }
  }
}

export async function uploadFileToSupabaseStorage(params: {
  fileName: string;
  content: string;
  contentType?: string;
}): Promise<string> {
  const supabase = getSupabaseServerClient();

  await ensureBucketExists(supabase);

  const storagePath = `uploads/${params.fileName}`;
  const blob = new Blob([params.content], { type: params.contentType || "text/plain" });

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, blob, {
    upsert: true,
    contentType: params.contentType || "text/plain",
  });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  console.log(`[supabase-storage] Uploaded file to bucket: ${STORAGE_BUCKET}/${storagePath}`);
  return storagePath;
}

export async function deleteDocumentFromSupabase(docId: string): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Try to find file_path to delete from storage bucket if it exists
  const filePath = await fetchDocumentPathById(docId);
  if (filePath) {
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    if (storageError) {
      console.error(`[supabase] Failed to delete file from storage: ${storageError.message}`);
    }
  }

  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

export async function saveQueryLogToSupabase(log: {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  queryText: string;
  responseText: string;
  status: "success" | "failed";
  citations: Array<{ sourceDoc: string; page?: string; section?: string; snippet?: string }>;
}): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { error: logError } = await supabase.from("query_logs").insert({
      id: log.id,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      query_text: log.queryText,
      response_text: log.responseText,
      status: log.status,
      timestamp: new Date().toISOString(),
    });

    if (logError) {
      throw logError;
    }

    if (log.citations && log.citations.length > 0) {
      const citationRows = log.citations.map((c) => ({
        query_id: log.id,
        source_doc: c.sourceDoc,
        page: c.page || null,
        section: c.section || null,
        snippet: c.snippet || null,
      }));
      const { error: citationError } = await supabase.from("citations").insert(citationRows);
      if (citationError) {
        console.error("[supabase] Citation save failed:", citationError);
      }
    }
  } catch (err) {
    console.error("[supabase] Failed to save query log:", err);
  }
}

export async function saveFeedbackToSupabase(feedback: {
  queryId: string;
  rating: "like" | "dislike";
  comments?: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("feedback").upsert({
      query_id: feedback.queryId,
      rating: feedback.rating,
      comments: feedback.comments || null,
      timestamp: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (err) {
    console.error("[supabase] Failed to save feedback:", err);
  }
}

export async function fetchQueryLogsFromSupabase(): Promise<any[]> {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Fetch logs
    const { data: logs, error: logsError } = await supabase
      .from("query_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (logsError) throw logsError;
    if (!logs || logs.length === 0) return [];

    // 2. Fetch citations
    const { data: citations, error: citationsError } = await supabase.from("citations").select("*");

    // 3. Fetch feedback
    const { data: feedbacks, error: feedbackError } = await supabase.from("feedback").select("*");

    // Map and assemble
    return logs.map((log) => {
      const logCitations = (citations || [])
        .filter((c) => c.query_id === log.id)
        .map((c) => ({
          sourceDoc: c.source_doc,
          page: c.page,
          section: c.section,
          snippet: c.snippet,
        }));

      const logFeedback = (feedbacks || []).find((f) => f.query_id === log.id);

      return {
        id: log.id,
        userId: log.user_id,
        userName: log.user_name,
        userRole: log.user_role,
        queryText: log.query_text,
        responseText: log.response_text,
        citations: logCitations,
        timestamp: log.timestamp,
        status: log.status,
        feedback: logFeedback
          ? {
              rating: logFeedback.rating,
              comments: logFeedback.comments,
            }
          : undefined,
      };
    });
  } catch (err) {
    console.error("[supabase] Failed to fetch query logs:", err);
    return [];
  }
}
