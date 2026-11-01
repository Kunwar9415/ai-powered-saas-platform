import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      icon: 'text-indigo-400',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      icon: 'text-pink-400',
      glow: 'group-hover:shadow-pink-500/10',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      glow: 'group-hover:shadow-purple-500/10',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      glow: 'group-hover:shadow-blue-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`group glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${scheme.glow}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5">{value}</h3>
          {change && (
            <p className={`text-xs mt-1.5 font-medium ${changeType === 'positive' ? 'text-emerald-400' : 'text-gray-400'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border`}>
          <Icon className={`w-6 h-6 ${scheme.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
