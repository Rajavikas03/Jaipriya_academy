import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function Docs() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const response = await apiClient('/documents/', { method: 'GET' });
        setDocuments(response || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              My Documents
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-light">
            View and download study materials and resources.
          </p>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{doc.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{doc.description}</p>
                  <span className="text-xs text-slate-400 block mb-4">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                  <a 
                    href={doc.file_url} 
                    download
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">No documents available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
