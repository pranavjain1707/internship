/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Check,
  Database,
  Trash2,
  FolderOpen,
  Calendar,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Shield,
} from "lucide-react";
import { Document, User } from "../../types";
import { logUserActivity } from "../../lib/activity-client";

interface DocumentCenterProps {
  currentUser: User;
  triggerUndo: (message: string, onUndo: () => void, onConfirm?: () => void) => void;
  companyName?: string;
}

export default function DocumentCenter({ currentUser, triggerUndo, companyName }: DocumentCenterProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Category mapping
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Preview Drawer/Modal
  const [activePreviewDoc, setActivePreviewDoc] = useState<Document | null>(null);

  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const [companyUsersList, setCompanyUsersList] = useState<User[]>([]);
  const [downloadRequestDoc, setDownloadRequestDoc] = useState<Document | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState("");
  const [downloadRequestsList, setDownloadRequestsList] = useState<any[]>([]);

  const fetchDownloadRequestsLocal = () => {
    const compKey = (companyName || "ekaba").trim().toLowerCase();
    const str = localStorage.getItem(`kb_portal_download_requests_${compKey}`);
    if (str) {
      try {
        setDownloadRequestsList(JSON.parse(str));
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchDownloadRequestsLocal();
    const interval = setInterval(fetchDownloadRequestsLocal, 1500);
    return () => clearInterval(interval);
  }, [companyName]);

  useEffect(() => {
    fetch(`/api/users?company=${encodeURIComponent(companyName || "ekaba")}`)
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        setCompanyUsersList(data.filter((u: User) => u.role === "Owner" || u.role === "Manager"));
      })
      .catch((err) => console.error("Error loading users for download sponsor:", err));
  }, [companyName]);

  const handleDownloadPDF = async (doc: Document) => {
    // Owner is bypass / can do what he wants
    if (currentUser.role === "Owner") {
      performDownload(doc);
      return;
    }

    // Check if there is an approved request
    const myRequest = downloadRequestsList.find(
      (r) => r.documentId === doc.id && r.requestedBy === currentUser.name
    );

    if (myRequest && myRequest.status === "approved") {
      performDownload(doc);
      return;
    }

    if (myRequest && myRequest.status === "pending") {
      alert(`Download permission is currently PENDING review by ${myRequest.sponsorName || 'upper authorities'}.`);
      return;
    }

    if (myRequest && myRequest.status === "rejected") {
      alert("Download permission was REJECTED by upper authorities. You can submit another request.");
    }

    // Open request modal
    setDownloadRequestDoc(doc);
    if (companyUsersList.length > 0) {
      setSelectedSponsor(companyUsersList[0].name);
    }
  };

  const performDownload = async (doc: Document) => {
    setDownloadingDocId(doc.id);
    
    // Simulate compilation/loading phase
    await new Promise((resolve) => setTimeout(resolve, 800));

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setDownloadingDocId(null);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              color: #0f172a;
            }
            .meta {
              font-size: 11px;
              color: #64748b;
              margin-top: 8px;
              font-family: monospace;
            }
            .content {
              font-size: 13px;
              white-space: pre-wrap;
              background: #f8fafc;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              text-align: center;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${doc.name}</div>
            <div class="meta">Category: ${doc.category} | File Type: ${doc.fileType.toUpperCase()} | Size: ${doc.size} | Upload Date: ${doc.dateUploaded}</div>
          </div>
          <div class="content">${doc.content}</div>
          <div class="footer">
            Generated from EKABA Knowledge Base Portal on ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setDownloadingDocId(null);
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents?company=${encodeURIComponent(companyName || "ekaba")}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed to load documents list from database:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = (docToDelete: Document) => {
    if (currentUser.role !== "Owner") return;
    // 1. Optimistically remove from frontend UI list
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));

    // 2. Log activity
    logUserActivity(currentUser.id, currentUser.name, `Deleted document "${docToDelete.name}"`);

    // 3. Trigger 3-second undo
    triggerUndo(
      `Deleted document "${docToDelete.name}"`,
      () => {
        // Revert UI removal and log
        setDocuments((prev) => [...prev, docToDelete].sort((a, b) => a.name.localeCompare(b.name)));
        logUserActivity(currentUser.id, currentUser.name, `Undid deletion of "${docToDelete.name}"`);
      },
      async () => {
        // Confirmed: perform actual delete
        await fetch(`/api/documents?id=${docToDelete.id}`, { method: "DELETE" });
      }
    );
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError("");
    setUploadSuccess(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    setUploadSuccess(false);
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  // Process Document and upload
  const processFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "docx", "pptx", "txt"];

    if (!extension || !allowedExtensions.includes(extension)) {
      setUploadError(
        `Unsupported file format. Supported file types (FR-4): .pdf, .docx, .pptx, .txt`,
      );
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    // Read the file content
    const reader = new FileReader();

    reader.onload = async (e) => {
      let contentString = "";

      if (extension === "txt") {
        contentString = (e.target?.result as string) || "";
      } else {
        // Mock parsing for rich file formats inside the secure container environment
        contentString = `[Ingested Binary Material: ${file.name}]\nFormat Context: parsed structure for .${extension}\n\nEnterprise manual segment imported on ${new Date().toLocaleDateString()}:\nThis describes key operational processes extracted semantically from files named ${file.name}. In standard production environments, this text is extracted during backend OCR, indexed using embeddings, and cached inside the Vector Database.\n\nKey policy points:\n- System process approved by ${currentUser.name}.\n- Associated audits must align with ISO 27001.\n- Please follow standard HRMS submission criteria.`;
      }

      try {
        const categoryMapping: Record<string, string> = {
          pdf: "Operations & Manuals",
          docx: "Contracts & Handbook",
          pptx: "Product Strategy",
          txt: "System Policies",
        };

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
            category: categoryMapping[extension] || "General",
            content: contentString,
            fileType: extension,
            uploadedBy: currentUser.name,
            company: companyName || "ekaba",
          }),
        });

        if (res.ok) {
          const newDoc = await res.json();
          setUploadProgress(100);
          setTimeout(() => {
            setUploadSuccess(true);
            setUploadProgress(null);
            fetchDocuments();

            // Log activity and register undo action
            logUserActivity(currentUser.id, currentUser.name, `Uploaded document "${file.name}"`);
            triggerUndo(
              `Uploaded document "${file.name}"`,
              async () => {
                await fetch(`/api/documents?id=${newDoc.id}`, { method: "DELETE" });
                fetchDocuments();
                logUserActivity(currentUser.id, currentUser.name, `Undid upload of "${file.name}"`);
              }
            );
          }, 300);
        } else {
          throw new Error("Unable to parse document in the repository database.");
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setUploadError(errorObj.message || "Failed to catalog document. Network error.");
        setUploadProgress(null);
      }
    };

    reader.readAsText(file);
  };

  const filteredDocs =
    selectedCategory === "All"
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const categories = ["All", ...Array.from(new Set(documents.map((d) => d.category)))];

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      {/* Index list */}
      <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display font-bold text-slate-800 text-lg">
              Document Knowledge Center
            </h2>
            <p className="text-xs text-slate-400">
              Available resources inside the secure searchable database
            </p>
          </div>

          {/* Categories Tab Pillboxes */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-sm font-mono">RETRIEVING FILES...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              No documents cataloged in this filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Upload files on the right to expand search vectors.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className="font-display font-medium text-slate-800 text-sm truncate"
                          title={doc.name}
                        >
                          {doc.name}
                        </h4>
                        <span className="inline-block bg-slate-200 text-slate-600 rounded text-[9px] font-mono px-1.5 py-0.5 mt-0.5 uppercase tracking-wider font-bold">
                          {doc.fileType}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold shrink-0 max-w-[130px] truncate">
                      {doc.category}
                    </span>
                  </div>

                  {/* Sneak peek */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 bg-white border border-slate-100 rounded-lg p-2">
                    {doc.content}
                  </p>
                </div>

                {/* Card footer metadata */}
                <div className="border-t border-slate-150 mt-4 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-355" />
                    <span>{doc.dateUploaded}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{doc.size}</span>
                    <button
                      onClick={() => setActivePreviewDoc(doc)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    {downloadingDocId === doc.id ? (
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling...</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDownloadPDF(doc)}
                        className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    )}
                    {currentUser.role === "Owner" && (
                      <button
                        onClick={() => handleDeleteDoc(doc)}
                        className="text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Drag zone (Section 9.4: FR-4 Document Upload) */}
      <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-display font-bold text-slate-800 text-md">
            Ingest Document Material
          </h2>
          <p className="text-xs text-slate-400">Allowed formats (FR-4): PDF, DOCX, PPTX, TXT</p>
        </div>

        <form
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] relative cursor-pointer ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
          }`}
          onClick={() => document.getElementById("file_uploader_id")?.click()}
        >
          <input
            id="file_uploader_id"
            type="file"
            onChange={handleFileInput}
            multiple={false}
            accept=".pdf,.docx,.pptx,.txt"
            className="hidden"
          />

          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-full mb-3 shadow-inner">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-xs font-semibold text-slate-700">
            Drag & Drop any corporate document here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            or <span className="text-indigo-650 font-bold hover:underline">browse files</span> on
            your computer
          </p>

          {uploadProgress !== null && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 space-y-2">
              <Loader2 className="w-7 h-7 text-indigo-655 animate-spin" />
              <span className="text-xs font-mono font-bold text-indigo-650">
                EXTRACTING METADATA: {uploadProgress}%
              </span>
              <div className="w-2/3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </form>

        {uploadSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs flex gap-2.5 items-center">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Document cataloged successfully!</span>
              <p className="text-[10px] text-emerald-650 mt-0.5">
                We segmented your text into indexable vectors for instant RAG responses.
              </p>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs flex gap-2.5 items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Encryption/Extraction Failed</span>
              <p className="text-[10px] text-rose-600 mt-0.5">{uploadError}</p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
          <div className="flex gap-2 text-slate-500">
            <Database className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold block text-slate-700 font-mono">
                ISO 27001 Secure Cryptography
              </span>
              Your imported text contents are processed only within the server's Node.js memory
              boundaries using AES-256 equivalent transient storage schemas.
            </div>
          </div>
        </div>
      </div>

      {/* Full Document Content Preview Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-205 shadow-xl max-w-2xl w-full flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    {activePreviewDoc.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-indigo-50 border border-indigo-105 text-indigo-600 uppercase tracking-widest text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {activePreviewDoc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activePreviewDoc.size}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={downloadingDocId === activePreviewDoc.id}
                  className="text-xs text-white bg-emerald-605 hover:bg-emerald-700 disabled:bg-emerald-500/55 disabled:cursor-not-allowed font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                  onClick={() => handleDownloadPDF(activePreviewDoc)}
                >
                  {downloadingDocId === activePreviewDoc.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-202 font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  onClick={() => setActivePreviewDoc(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Modal Content Scroll Container */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                Document Content Structure
              </span>
              <div className="white-space-pre-line bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-700 text-xs leading-relaxed font-mono">
                {activePreviewDoc.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono rounded-b-2xl">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-350" />
                <span>Uploaded by: {activePreviewDoc.uploadedBy}</span>
              </div>
              <span>INGESTION STATUS: LIVE_VECTORS_CACHED</span>
            </div>
          </div>
        </div>
      )}
      {/* Download Sponsoring Modal */}
      {downloadRequestDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold border-b pb-3">
              <Shield className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-display uppercase tracking-wider">
                Clearance Required
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                To download <strong>{downloadRequestDoc.name}</strong> under RBAC restrictions, an upper authority must grant a sponsoring clearance in their dashboard.
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 font-mono">
                <div>File: {downloadRequestDoc.name}</div>
                <div>Size: {downloadRequestDoc.size}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Select Sponsoring Authority
              </label>
              {companyUsersList.length === 0 ? (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 font-mono uppercase">
                  No upper posts available. System admin override applies.
                </div>
              ) : (
                <select
                  value={selectedSponsor}
                  onChange={(e) => setSelectedSponsor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  {companyUsersList.map((user) => (
                    <option key={user.name} value={user.name}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDownloadRequestDoc(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-2 px-4 text-xs font-semibold text-slate-550 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const compKey = (companyName || "ekaba").trim().toLowerCase();
                  let existing: any[] = [];
                  try {
                    const existingStr = localStorage.getItem(`kb_portal_download_requests_${compKey}`) || "[]";
                    existing = JSON.parse(existingStr);
                  } catch (e) {}

                  // Remove previous matching requests to avoid duplicates
                  existing = existing.filter(r => !(r.documentId === downloadRequestDoc.id && r.requestedBy === currentUser.name));

                  const newReq = {
                    id: `dl-req-${Date.now()}`,
                    documentId: downloadRequestDoc.id,
                    documentName: downloadRequestDoc.name,
                    requestedBy: currentUser.name,
                    requestedByRole: currentUser.role,
                    sponsorName: selectedSponsor || "System Admin",
                    status: "pending",
                    createdAt: new Date().toISOString(),
                  };

                  existing.push(newReq);
                  localStorage.setItem(`kb_portal_download_requests_${compKey}`, JSON.stringify(existing));
                  
                  logUserActivity(currentUser.id, currentUser.name, `Requested download clearance for "${downloadRequestDoc.name}"`);
                  setDownloadRequestDoc(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-4 text-xs font-semibold transition cursor-pointer text-center"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
