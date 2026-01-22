import React, { useMemo } from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { ProjectConfig, MasterBidItem, WeeklyBidEntry, ProjectBaselines } from '../../../types';
import { SectionWrapper } from './SectionWrapper';
import { RowBreakDivider, useHasBreakAtRow } from '../components/RowBreakDivider';
import { SplitRowControl } from '../components/SplitRowControl';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines | null;
  placement: PagePlacement;
  onToggleRowBreak?: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
}

// ... helper functions remain same ...

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper for number formatting (commas)
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Circular Progress Component
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Decide color based on percentage
  let colorClass = 'text-brand-primary';
  if (percentage >= 100) colorClass = 'text-green-500';
  else if (percentage === 0) colorClass = 'text-zinc-300';
  
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-zinc-100"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClass} transition-all duration-500 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[7px] font-bold text-zinc-700">{Math.round(percentage)}%</span>
    </div>
  );
};

export function ProgressSection({ config, reportData, projectConfig, baselines, placement, onToggleRowBreak }: Props) {
  // Combine Master Items with Weekly Progress
  const { tableData, totals } = useMemo(() => {
    // USE BASELINES FOR MASTER ITEMS
    const masterItems: MasterBidItem[] = baselines?.bidItems || [];
    const weeklyProgress: WeeklyBidEntry[] = reportData.progress?.bidItems || [];

    let totalContractValue = 0;
    let totalEarnedToDate = 0;

    const items = masterItems.map(item => {
      const weeklyEntry = weeklyProgress.find(w => w.itemId === item.id) || {
        thisWeekQty: 0,
        toDateQty: 0,
        itemId: item.id,
        itemNumber: item.itemNumber,
        description: item.description
      };

      const toDateQty = weeklyEntry.toDateQty || 0;
      const thisWeekQty = weeklyEntry.thisWeekQty || 0;
      const prevQty = toDateQty - thisWeekQty;
      const remainingQty = item.contractQty - toDateQty;
      const percentComplete = item.contractQty > 0 ? (toDateQty / item.contractQty) * 100 : 0;
      
      const earnedValue = toDateQty * item.unitPrice;
      const itemTotalValue = item.contractQty * item.unitPrice;

      totalContractValue += itemTotalValue;
      totalEarnedToDate += earnedValue;

      return {
        ...item,
        prevQty,
        thisWeekQty,
        toDateQty,
        remainingQty,
        percentComplete,
        earnedValue,
        itemTotalValue
      };
    });

    const overallPercent = totalContractValue > 0 ? (totalEarnedToDate / totalContractValue) * 100 : 0;

    return {
      tableData: items,
      totals: {
        contractValue: totalContractValue,
        earnedToDate: totalEarnedToDate,
        percentComplete: overallPercent
      }
    };
  }, [baselines, reportData]);

  if (tableData.length === 0) return null;

  // Slicing Logic for Pagination
  let visibleItems = tableData;
  if (placement.dataRange) {
      visibleItems = tableData.slice(placement.dataRange.start, placement.dataRange.end);
  }

  const isContinued = placement.continuesFromPrevious;

  return (
    <SectionWrapper config={config} title={isContinued ? "Progress Report (Continued)" : "Progress Report"}>
      {/* Executive Summary Cards - ONLY SHOW ON FIRST PAGE */}
      {!isContinued && (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Card 1: Contract Value */}
        <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Contract Value</span>
          <span className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(totals.contractValue)}</span>
          <span className="text-[10px] text-zinc-400 mt-1">Original Contract Sum</span>
        </div>

        {/* Card 2: Earned to Date */}
        <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
           <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Earned to Date</span>
           <span className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(totals.earnedToDate)}</span>
           <span className="text-[10px] text-zinc-400 mt-1">Completed Work Value</span>
        </div>

        {/* Card 3: Overall Progress */}
        <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
           <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Project Progress</span>
           <div className="flex items-end gap-2 mt-1">
             <span className="text-2xl font-bold text-brand-primary">{totals.percentComplete.toFixed(1)}%</span>
             <span className="text-xs text-zinc-400 mb-1.5">Complete</span>
           </div>
           <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2 overflow-hidden">
             <div 
                className="bg-brand-primary h-full rounded-full transition-all duration-1000" 
                style={{ width: `${totals.percentComplete}%` }}
             ></div>
           </div>
        </div>
      </div>
      )}

      {/* Detailed Progress Table */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-primary text-white border-b border-brand-primary/20">
            <tr className="text-[9px] uppercase font-bold tracking-wider text-center">
              <th className="py-2 pl-3 text-left w-12 text-white/90">Item</th>
              <th className="py-2 pl-2 text-left text-white/90">Description</th>
              <th className="py-2 px-2 w-10 text-white/90">Unit</th>
              <th className="py-2 px-2 w-16 text-white/90">Qty</th>
              <th className="py-2 px-2 w-16 text-white/90">Prev</th>
              <th className="py-2 px-2 w-16 text-white/90">This Prd</th>
              <th className="py-2 px-2 w-16 text-white/90">To Date</th>
              <th className="py-2 px-2 w-16 text-white/90">Remain</th>
              <th className="py-2 px-2 w-14 text-white/90">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {visibleItems.map((item, i) => {
              // Calculate the actual row index in the full dataset
              const startIdx = placement.dataRange?.start ?? 0;
              const actualRowIndex = startIdx + i;
              const isLastRow = i === visibleItems.length - 1;
              const hasBreak = useHasBreakAtRow(config.manualBreaks, 'progress', actualRowIndex);

              return (
                <React.Fragment key={item.id}>
                  <tr className="group odd:bg-white even:bg-zinc-50/50 hover:bg-blue-50/30 transition-colors relative">
                    <td className="py-2 pl-3 font-mono text-xs text-zinc-500">{item.itemNumber}</td>
                    <td className="py-2 pl-2 font-semibold text-zinc-800 text-xs">{item.description}</td>
                    <td className="py-2 px-2 text-center text-[10px] text-zinc-500 uppercase">{item.unit}</td>
                    <td className="py-2 px-2 text-center font-mono text-xs text-zinc-600">{formatNumber(item.contractQty)}</td>
                    <td className="py-2 px-2 text-center font-mono text-xs text-zinc-400">{formatNumber(item.prevQty)}</td>
                    <td className="py-2 px-2 text-center font-mono text-xs font-bold text-brand-primary">{formatNumber(item.thisWeekQty)}</td>
                    <td className="py-2 px-2 text-center font-mono text-xs font-bold text-zinc-900 bg-zinc-50">{formatNumber(item.toDateQty)}</td>
                    <td className="py-2 px-2 text-center font-mono text-xs text-zinc-500">{formatNumber(item.remainingQty)}</td>
                    <td className="py-1 px-2 flex justify-center">
                      <CircularProgress percentage={item.percentComplete} />
                    </td>
                    
                    {/* Hover Split Control */}
                    {onToggleRowBreak && (
                      <td className="absolute left-0 right-0 bottom-0 h-0 p-0 border-none w-full">
                         <SplitRowControl 
                            sectionId="progress"
                            rowIndex={actualRowIndex}
                            hasBreak={hasBreak}
                            onToggle={() => onToggleRowBreak('progress', actualRowIndex, item.id)}
                         />
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
          {/* Footer Totals */}
          <tfoot className="bg-zinc-50 border-t border-zinc-200">
            <tr className="text-[10px] font-bold uppercase text-zinc-600">
                <td colSpan={2} className="py-2 pl-3">Total Earned Value</td>
                <td colSpan={4} className="py-2 px-2 text-right"></td>
                <td className="py-2 px-2 text-right text-zinc-900 text-xs">{formatCurrency(totals.earnedToDate)}</td>
                <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SectionWrapper>
  );
}
