import React, { useRef } from 'react';
import { WeeklyReport } from '../../../types';
import { Image, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    report: WeeklyReport;
}

export function PhotoGrid({ report }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const photos = report.photos || [];

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300; // Approx one card width
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Site Progress Gallery</h3>
                 <div className="flex items-center gap-2">
                     <button onClick={() => scroll('left')} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition">
                        <ChevronLeft size={16} />
                     </button>
                     <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">{photos.length} Photos</span>
                     <button onClick={() => scroll('right')} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition">
                        <ChevronRight size={16} />
                     </button>
                 </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide flex-1 items-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                 {photos.length > 0 ? photos.map((p, i) => (
                     <div key={i} className="min-w-[280px] h-full bg-zinc-100 rounded-lg overflow-hidden relative group border border-zinc-200 flex-shrink-0">
                         {p.url ? (
                             <>
                                <img src={p.url} alt={p.caption} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition duration-300">
                                     <p className="text-xs text-white font-medium truncate">{p.caption}</p>
                                     <p className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">{p.directionLooking}</p>
                                </div>
                             </>
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                                 <Image size={32} />
                                 <span className="text-[10px] mt-2">No Image</span>
                             </div>
                         )}
                     </div>
                 )) : (
                     <div className="w-full h-full flex items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-100 rounded-xl">
                         <div className="text-center">
                            <Image size={32} className="mx-auto mb-2 opacity-50"/>
                            <p className="text-xs">No photos available for this week</p>
                         </div>
                     </div>
                 )}
            </div>
        </div>
    );
}
