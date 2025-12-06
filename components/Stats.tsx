import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Stats: React.FC = () => {
  const { entries } = useApp();

  // Aggregate data: Count entries by student
  const studentCounts = entries.reduce((acc, entry) => {
    const name = entry.studentName || 'Anonymous';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(studentCounts).map(name => ({
    name,
    count: studentCounts[name]
  })).sort((a, b) => b.count - a.count);

  const totalWords = entries.length;
  const uniqueStudents = Object.keys(studentCounts).length;

  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308'];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium">
            <ArrowLeft size={18} /> Back to Feed
        </Link>
        <h2 className="text-4xl font-serif font-bold text-slate-900">Class Statistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4">Total Entries</h3>
            <div className="flex items-baseline gap-4">
                <p className="text-6xl font-bold text-indigo-600">{totalWords}</p>
                <p className="text-slate-400 font-medium">Shared knowledge</p>
            </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4">Active Contributors</h3>
            <div className="flex items-baseline gap-4">
                <p className="text-6xl font-bold text-emerald-600">{uniqueStudents}</p>
                <p className="text-slate-400 font-medium">Students engaged</p>
            </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
        <h3 className="text-xl font-bold text-slate-900 mb-8">Top Contributors</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                <p>No data available yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};