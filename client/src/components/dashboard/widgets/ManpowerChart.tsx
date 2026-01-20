import React, { useMemo } from 'react';
import { WeeklyReport } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
    report: WeeklyReport;
}

export function ManpowerChart({ report }: Props) {
    const data = useMemo(() => {
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        return days.map((day, index) => {
            let field = 0;
            let management = 0;
            let remote = 0;
            let sub = 0;

            report.resources.manpower.forEach(m => {
                const hours = m.dailyHours?.[day] || 0;
                
                if (m.type === 'subcontractor') {
                    sub += hours;
                } else {
                    // Granular RECON breakdown
                    const roleLower = m.role?.toLowerCase() || '';
                    const isMgmt = ['project manager', 'superintendent', 'safety', 'engineer', 'cm'].some(r => roleLower.includes(r));
                    
                    if (roleLower.includes('remote')) {
                        remote += hours;
                    } else if (isMgmt) {
                        management += hours;
                    } else {
                        field += hours; // Default to field staff (laborers, operators, etc)
                    }
                }
            });

            return {
                name: labels[index],
                Field: field,
                Management: management,
                Remote: remote,
                Subcontractor: sub,
                Total: field + management + remote + sub
            };
        });
    }, [report]);

    const totalHours = data.reduce((acc, curr) => acc + curr.Total, 0);

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                     <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Manpower Utilization</h3>
                     <div className="text-2xl font-bold text-zinc-800 mt-1">{totalHours} <span className="text-sm text-zinc-400 font-normal">Hrs</span></div>
                </div>
                {/* Legend or other controls could go here */}
            </div>
            
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 600}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#a1a1aa', fontSize: 10}} 
                        />
                        <Tooltip 
                            cursor={{fill: '#f4f4f5'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend 
                             verticalAlign="top" 
                             align="right" 
                             iconType="circle" 
                             iconSize={8}
                             wrapperStyle={{fontSize: '10px', fontWeight: 600, paddingBottom: '10px'}}
                        />
                        <Bar dataKey="Field" stackId="a" fill="#009fb7" name="Field Staff" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Management" stackId="a" fill="#4b5563" name="Mgmt" />
                        <Bar dataKey="Remote" stackId="a" fill="#9ca3af" name="Remote" />
                        <Bar dataKey="Subcontractor" stackId="a" fill="#fed766" name="Sub" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
