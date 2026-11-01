import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Trash2, X, Sparkles } from 'lucide-react';
import historyService from '../services/history.service';
import { useToast } from '../context/ToastContext';
import HistoryCard from '../components/HistoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AIResultCard from '../components/AIResultCard';

export const History = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolFilter, setToolFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [selectedItem, setSelectedItem] = useState(null);

  const toast = useToast();

  const fetchHistory = async (page = 1, filter = toolFilter, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await historyService.getUserHistory({
        toolType: filter,
        search,
        page,
        limit: 15,
      });

      if (res.data) {
        setHistoryList(res.data.history || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error('Failed to load history: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, toolFilter, searchTerm);
  }, [toolFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory(1, toolFilter, searchTerm);
  };

  const handleDeleteItem = async (historyId) => {
    if (!window.confirm('Delete this record from generation history?')) return;

    try {
      await historyService.deleteHistoryItem(historyId);
      toast.success('History record removed.');
      setHistoryList((prev) => prev.filter((item) => (item.historyId || item.id) !== historyId));
      if (selectedItem && (selectedItem.historyId || selectedItem.id) === historyId) {
        setSelectedItem(null);
      }
    } catch (err) {
      toast.error('Failed to delete history item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('CAUTION: This will permanently remove all activity history records. Proceed?')) return;

    try {
      await historyService.clearAllHistory();
      toast.success('All history records cleared.');
      setHistoryList([]);
      setSelectedItem(null);
    } catch (err) {
      toast.error('Failed to clear history: ' + (err.response?.data?.message || err.message));
    }
  };

  const filters = [
    { id: 'all', label: 'All Activities' },
    { id: 'text', label: 'Chat & Text' },
    { id: 'image', label: 'Image Studio' },
    { id: 'document', label: 'Documents' },
    { id: 'resume', label: 'Resume ATS' },
    { id: 'article', label: 'Articles' },
    { id: 'title', label: 'Headlines' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            Audit & Storage Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Activity History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse, search, and inspect past generation outputs and intelligence audits.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-danger !px-3.5 !py-2 text-xs font-semibold self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="chat-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Horizontal Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setToolFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                toolFilter === f.id
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompt or output..."
            className="studio-input w-full pl-9 pr-8 text-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchHistory(1, toolFilter, '');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Retrieving history logs..." size="lg" />
        </div>
      ) : historyList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historyList.map((item) => (
            <HistoryCard
              key={item.historyId || item.id}
              historyItem={item}
              onView={(h) => setSelectedItem(h)}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="chat-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto text-purple-600">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Generation History Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || toolFilter !== 'all'
              ? 'No matching records for current filter. Try adjusting your search query.'
              : 'You have not run any generations yet. Start by generating text or analyzing documents.'}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchHistory(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn-secondary !px-3 !py-1 text-xs font-semibold disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-semibold px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchHistory(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary !px-3 !py-1 text-xs font-semibold disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                {selectedItem.generation?.toolType} Output
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedItem.generation?.prompt}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Generated: {new Date(selectedItem.createdAt).toLocaleString()} • Engine: {selectedItem.generation?.provider?.toUpperCase()}
              </p>
            </div>

            {selectedItem.generation?.toolType === 'image' ? (
              <div className="rounded-xl overflow-hidden bg-slate-900 p-2 border border-slate-800">
                <img
                  src={selectedItem.generation?.result}
                  alt={selectedItem.generation?.prompt}
                  className="w-full max-h-[450px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <AIResultCard
                result={selectedItem.generation?.result}
                provider={selectedItem.generation?.provider}
                toolType={selectedItem.generation?.toolType}
                title="Historical Generation Output"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
