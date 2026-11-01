import React from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  FileText,
  UserCheck,
  BookOpen,
  Sparkles,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const HistoryCard = ({ historyItem, onView, onDelete }) => {
  const generation = historyItem?.generation;
  if (!generation) return null;

  const toolIcons = {
    text: { icon: MessageSquare, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    image: { icon: ImageIcon, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
    document: { icon: FileText, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    resume: { icon: UserCheck, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    article: { icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    title: { icon: Sparkles, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  };

  const toolConfig = toolIcons[generation.toolType] || toolIcons.text;
  const ToolIcon = toolConfig.icon;

  const formattedDate = new Date(generation.createdAt || historyItem.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const previewResult =
    generation.toolType === 'image'
      ? 'Generated AI Image Output'
      : typeof generation.result === 'string'
      ? generation.result.substring(0, 140).replace(/[\n\r]+/g, ' ') + '...'
      : 'Structured Analysis Output';

  return (
    <div className="chat-card p-4 flex flex-col justify-between gap-3 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 overflow-hidden">
          <div className={`p-2.5 rounded-xl ${toolConfig.bg} ${toolConfig.border} border shrink-0 mt-0.5`}>
            <ToolIcon className={`w-4 h-4 ${toolConfig.color}`} />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {generation.toolType}
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {generation.provider}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate mt-1">{generation.prompt}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(historyItem.historyId || historyItem.id);
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
          title="Delete history entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-2 leading-relaxed">
        {previewResult}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
        <button
          onClick={() => onView(historyItem)}
          className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
        >
          Inspect
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;
