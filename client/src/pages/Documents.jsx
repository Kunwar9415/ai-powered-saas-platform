import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Trash2, Sparkles, Calendar, Plus } from 'lucide-react';
import documentService from '../services/document.service';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentService.getUserDocuments();
      if (res.data?.documents) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      toast.error('Failed to load documents: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return;

    try {
      await documentService.deleteDocument(docId);
      toast.success('Document deleted successfully.');
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      toast.error('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            Document Storage Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Secure storage of uploaded research papers, resumes, and text files ready for AI querying.
          </p>
        </div>

        <button
          onClick={() => navigate('/document-analyzer')}
          className="btn-gemini text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Retrieving document records..." size="lg" />
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="chat-card p-5 flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                      {doc.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.fileType}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => navigate('/document-analyzer')}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Analyze
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="chat-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Vault is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload PDF, DOCX, or TXT documents to analyze summaries and extract entity insights.
          </p>
          <button
            onClick={() => navigate('/document-analyzer')}
            className="btn-gemini text-xs font-semibold mt-2"
          >
            Upload First Document
          </button>
        </div>
      )}
    </div>
  );
};

export default Documents;
