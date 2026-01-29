import React, { useState } from 'react';
import { 
  FileText, Cloud, TrendingUp, Camera, Users, Truck, Shield, 
  DollarSign, Calendar, ClipboardList, Table, Image, Type, 
  Minus, Square, ChevronDown, ChevronRight, GripVertical,
  Undo, Redo, Grid3X3, Eye, Download, ZoomIn, ZoomOut,
  Check, Settings, Layers, Sun, CloudRain, Thermometer
} from 'lucide-react';

export default function PrintStudioMockup() {
  const [selectedSection, setSelectedSection] = useState('cover');
  const [zoom, setZoom] = useState(65);
  const [showGrid, setShowGrid] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(['sections', 'elements']);
  const [enabledSections, setEnabledSections] = useState({
    cover: true, executive: true, weather: true, progress: true,
    lookahead: false, photos: true, personnel: false,
    equipment: false, safety: true, financials: false,
  });

  const sections = [
    { id: 'cover', label: 'Cover Page', icon: FileText },
    { id: 'executive', label: 'Executive Summary', icon: ClipboardList },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'lookahead', label: '3-Week Look Ahead', icon: Calendar },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'personnel', label: 'Personnel', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Truck },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'financials', label: 'Financials', icon: DollarSign },
  ];

  const elements = [
    { type: 'table', label: 'Table', icon: Table },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'text', label: 'Text', icon: Type },
    { type: 'divider', label: 'Divider', icon: Minus },
  ];

  const toggleGroup = (group) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const toggleSection = (id) => {
    setEnabledSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pageWidth = (8.5 * 72 * zoom) / 100;
  const pageHeight = (11 * 72 * zoom) / 100;

  // Page component wrapper
  const Page = ({ pageNum, totalPages, sectionId, children }) => (
    <div 
      className={`bg-white shadow-xl rounded-sm overflow-hidden relative shrink-0 mb-6 cursor-pointer transition-all ${
        selectedSection === sectionId ? 'ring-2 ring-teal-500' : 'hover:ring-1 hover:ring-teal-300'
      }`}
      style={{ width: pageWidth, height: pageHeight }}
      onClick={() => setSelectedSection(sectionId)}
    >
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: 'linear-gradient(to right, #008B8B 1px, transparent 1px), linear-gradient(to bottom, #008B8B 1px, transparent 1px)', backgroundSize: '8px 8px' }}
        />
      )}
      <div className="h-full flex flex-col" style={{ fontSize: `${zoom / 100}em` }}>
        {children}
        {/* Page Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-1.5 flex justify-between text-gray-400 border-t border-gray-100" style={{ fontSize: '0.4em' }}>
          <span>Ford City - Former Facility SLA</span>
          <span>Page {pageNum} of {totalPages}</span>
        </div>
      </div>
      {selectedSection === sectionId && (
        <div className="absolute -top-5 left-1 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-t font-medium" style={{ fontSize: '10px' }}>
          {sections.find(s => s.id === sectionId)?.label}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 text-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-11 bg-white border-b border-gray-200 flex items-center px-3 gap-1.5 shrink-0">
        <div className="flex items-center gap-0.5 pr-3 border-r border-gray-200">
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Undo size={16} /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Redo size={16} /></button>
        </div>
        
        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          <button onClick={() => setZoom(Math.max(40, zoom - 10))} className="p-1 hover:bg-gray-100 rounded text-gray-400">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-medium w-10 text-center text-gray-600">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(120, zoom + 10))} className="p-1 hover:bg-gray-100 rounded text-gray-400">
            <ZoomIn size={14} />
          </button>
        </div>

        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded flex items-center gap-1 text-xs ${showGrid ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <Grid3X3 size={14} /> Grid
        </button>

        <button className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1 text-xs text-gray-500">
          <Eye size={14} /> Preview
        </button>

        <div className="flex-1" />

        <div className="text-xs text-gray-400 flex items-center gap-1 mr-2">
          <Check size={12} className="text-green-500" /> Saved
        </div>

        <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center gap-1.5 text-xs transition-colors">
          <Download size={14} /> Generate PDF
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-2.5 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Builder</div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Sections */}
            <div className="border-b border-gray-100">
              <button 
                onClick={() => toggleGroup('sections')}
                className="w-full px-2.5 py-2 flex items-center gap-1.5 hover:bg-gray-50 text-left"
              >
                {expandedGroups.includes('sections') ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                <Layers size={12} className="text-gray-500" />
                <span className="font-medium text-gray-700 text-xs">Sections</span>
                <span className="ml-auto text-xs text-gray-400">{Object.values(enabledSections).filter(Boolean).length}</span>
              </button>
              
              {expandedGroups.includes('sections') && (
                <div className="pb-1.5">
                  {sections.map(section => (
                    <div
                      key={section.id}
                      className={`mx-1.5 mb-0.5 px-1.5 py-1.5 rounded flex items-center gap-1.5 cursor-pointer group transition-all ${
                        selectedSection === section.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <GripVertical size={10} className="text-gray-300 opacity-0 group-hover:opacity-100" />
                      <input
                        type="checkbox"
                        checked={enabledSections[section.id]}
                        onChange={() => toggleSection(section.id)}
                        className="w-3 h-3 rounded border-gray-300 text-teal-600"
                        onClick={e => e.stopPropagation()}
                      />
                      <section.icon size={12} className={selectedSection === section.id ? 'text-teal-600' : 'text-gray-400'} />
                      <span className={`text-xs ${selectedSection === section.id ? 'text-teal-700 font-medium' : 'text-gray-600'}`}>
                        {section.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elements */}
            <div>
              <button 
                onClick={() => toggleGroup('elements')}
                className="w-full px-2.5 py-2 flex items-center gap-1.5 hover:bg-gray-50 text-left"
              >
                {expandedGroups.includes('elements') ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                <Square size={12} className="text-gray-500" />
                <span className="font-medium text-gray-700 text-xs">Elements</span>
              </button>
              
              {expandedGroups.includes('elements') && (
                <div className="pb-2 px-1.5 grid grid-cols-2 gap-1">
                  {elements.map(element => (
                    <div key={element.type} className="p-2 rounded border border-gray-200 hover:border-teal-300 hover:bg-teal-50 cursor-grab flex flex-col items-center gap-1 transition-all group">
                      <element.icon size={16} className="text-gray-400 group-hover:text-teal-600" />
                      <span className="text-xs text-gray-500 group-hover:text-teal-700">{element.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Scrollable Canvas */}
        <div className="flex-1 overflow-auto p-6" style={{ background: '#9ca3af' }}>
          <div className="flex flex-col items-center">
            
            {/* PAGE 1: Cover */}
            {enabledSections.cover && (
              <Page pageNum={1} totalPages={5} sectionId="cover">
                {/* Hero */}
                <div className="relative" style={{ height: '38%' }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2d4a6f 50%, #1a365d 100%)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,139,139,0.3), rgba(0,139,139,0.6))' }} />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute bottom-0 left-1/4 w-1/6 h-2/3 bg-gray-400" />
                    <div className="absolute bottom-0 left-1/2 w-1/5 h-1/2 bg-gray-500" />
                    <div className="absolute bottom-0 right-1/4 w-1/6 h-3/4 bg-gray-400" />
                  </div>
                  <div className="absolute top-3 left-4 text-white font-bold tracking-wider" style={{ fontSize: '0.9em' }}>RECON</div>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-3 flex flex-col relative">
                  <h1 className="font-bold text-gray-900 leading-tight" style={{ fontSize: '1.2em' }}>Ford City - Former Facility SLA</h1>
                  <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: '1em' }}>2024 Site Improvements</h2>
                  <p className="mt-0.5 font-medium" style={{ color: '#008B8B', fontSize: '0.65em' }}>1696 Ford City Road, Kittanning, PA</p>
                  <div className="mt-1.5 h-0.5 w-12" style={{ background: '#008B8B' }} />
                  <p className="mt-1.5 font-semibold text-gray-800 tracking-wide uppercase" style={{ fontSize: '0.7em' }}>Weekly Progress Report</p>
                  <p className="font-medium" style={{ color: '#008B8B', fontSize: '0.55em' }}>Week Ending: January 25, 2026</p>

                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 rounded overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                        <Camera size={12} className="text-gray-300" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 space-y-0" style={{ fontSize: '0.5em' }}>
                    <div className="flex"><span className="font-semibold w-12">Client:</span><span>PPG Industries, Inc.</span></div>
                    <div className="flex"><span className="font-semibold w-12">Address:</span><span>1696 Ford City Road, Kittanning, PA</span></div>
                    <div className="flex"><span className="font-semibold w-12">Job #:</span><span>850030</span></div>
                  </div>

                  <div className="absolute left-0 right-0 text-white text-center py-1 italic font-medium" style={{ background: '#008B8B', bottom: '2em', fontSize: '0.45em' }}>
                    "Safety is a core value — not a priority that changes."
                  </div>
                </div>
              </Page>
            )}

            {/* PAGE 2: Executive Summary */}
            {enabledSections.executive && (
              <Page pageNum={2} totalPages={5} sectionId="executive">
                <div className="p-4 flex-1">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: '#008B8B' }}>
                    <ClipboardList size={16} style={{ color: '#008B8B' }} />
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '1em' }}>Executive Summary</h2>
                  </div>
                  
                  {/* Summary Content */}
                  <div className="space-y-2" style={{ fontSize: '0.55em' }}>
                    <p className="text-gray-700 leading-relaxed">
                      Work continued on the site improvements project this week with significant progress made on grading and drainage installation. 
                      The crew completed the northern retention basin excavation and began installing the 24" HDPE storm drain piping.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Weather conditions were favorable with only one day lost to rain on Tuesday. 
                      Overall project remains on schedule with completion targeted for March 15, 2026.
                    </p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <div className="font-bold text-lg" style={{ color: '#008B8B' }}>68%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <div className="font-bold text-lg text-green-600">On Track</div>
                        <div className="text-xs text-gray-500">Schedule</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <div className="font-bold text-lg" style={{ color: '#008B8B' }}>4</div>
                        <div className="text-xs text-gray-500">Days Worked</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Page>
            )}

            {/* PAGE 3: Weather */}
            {enabledSections.weather && (
              <Page pageNum={3} totalPages={5} sectionId="weather">
                <div className="p-4 flex-1">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: '#008B8B' }}>
                    <Cloud size={16} style={{ color: '#008B8B' }} />
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '1em' }}>Weather Conditions</h2>
                  </div>
                  
                  {/* Weather Table */}
                  <table className="w-full" style={{ fontSize: '0.5em' }}>
                    <thead>
                      <tr style={{ background: '#008B8B' }}>
                        <th className="text-left text-white p-1.5 font-semibold">Date</th>
                        <th className="text-left text-white p-1.5 font-semibold">Conditions</th>
                        <th className="text-center text-white p-1.5 font-semibold">High</th>
                        <th className="text-center text-white p-1.5 font-semibold">Low</th>
                        <th className="text-center text-white p-1.5 font-semibold">Precip</th>
                        <th className="text-left text-white p-1.5 font-semibold">Work Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { day: 'Mon 1/20', cond: 'Sunny', icon: Sun, hi: 42, lo: 28, precip: '0"', impact: 'Full Day' },
                        { day: 'Tue 1/21', cond: 'Rain', icon: CloudRain, hi: 38, lo: 34, precip: '0.8"', impact: 'No Work', impactColor: 'text-red-600' },
                        { day: 'Wed 1/22', cond: 'Cloudy', icon: Cloud, hi: 45, lo: 32, precip: '0"', impact: 'Full Day' },
                        { day: 'Thu 1/23', cond: 'Sunny', icon: Sun, hi: 48, lo: 30, precip: '0"', impact: 'Full Day' },
                        { day: 'Fri 1/24', cond: 'Sunny', icon: Sun, hi: 52, lo: 35, precip: '0"', impact: 'Full Day' },
                        { day: 'Sat 1/25', cond: 'Cloudy', icon: Cloud, hi: 44, lo: 29, precip: '0"', impact: 'Half Day' },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-1.5 font-medium">{row.day}</td>
                          <td className="p-1.5 flex items-center gap-1">
                            <row.icon size={12} className="text-gray-400" />
                            {row.cond}
                          </td>
                          <td className="p-1.5 text-center">{row.hi}°F</td>
                          <td className="p-1.5 text-center">{row.lo}°F</td>
                          <td className="p-1.5 text-center">{row.precip}</td>
                          <td className={`p-1.5 font-medium ${row.impactColor || 'text-green-600'}`}>{row.impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-2 mt-3" style={{ fontSize: '0.45em' }}>
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <Thermometer size={14} className="mx-auto text-blue-500 mb-1" />
                      <div className="font-bold">45°F</div>
                      <div className="text-gray-500">Avg High</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <Thermometer size={14} className="mx-auto text-blue-500 mb-1" />
                      <div className="font-bold">31°F</div>
                      <div className="text-gray-500">Avg Low</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <CloudRain size={14} className="mx-auto text-blue-500 mb-1" />
                      <div className="font-bold">0.8"</div>
                      <div className="text-gray-500">Total Precip</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <Check size={14} className="mx-auto text-green-500 mb-1" />
                      <div className="font-bold">4.5</div>
                      <div className="text-gray-500">Days Worked</div>
                    </div>
                  </div>
                </div>
              </Page>
            )}

            {/* PAGE 4: Photos */}
            {enabledSections.photos && (
              <Page pageNum={4} totalPages={5} sectionId="photos">
                <div className="p-4 flex-1">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: '#008B8B' }}>
                    <Camera size={16} style={{ color: '#008B8B' }} />
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '1em' }}>Site Photos</h2>
                  </div>
                  
                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.45em' }}>
                    {[
                      { caption: 'North retention basin excavation - Looking East', date: '01/22/2026' },
                      { caption: 'Storm drain installation at STA 4+50 - Looking North', date: '01/23/2026' },
                      { caption: 'Grading operations near building pad - Looking South', date: '01/24/2026' },
                      { caption: 'Completed inlet structure at low point - Looking West', date: '01/24/2026' },
                    ].map((photo, i) => (
                      <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="bg-gray-100 flex items-center justify-center" style={{ height: '100px' }}>
                          <Camera size={24} className="text-gray-300" />
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-gray-700 italic leading-snug">{photo.caption}</p>
                          <p className="text-gray-400 mt-1">{photo.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Page>
            )}

            {/* PAGE 5: Safety */}
            {enabledSections.safety && (
              <Page pageNum={5} totalPages={5} sectionId="safety">
                <div className="p-4 flex-1">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: '#008B8B' }}>
                    <Shield size={16} style={{ color: '#008B8B' }} />
                    <h2 className="font-bold text-gray-900" style={{ fontSize: '1em' }}>Safety Report</h2>
                  </div>
                  
                  {/* Safety Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4" style={{ fontSize: '0.5em' }}>
                    <div className="p-3 bg-green-50 rounded text-center border border-green-200">
                      <div className="font-bold text-2xl text-green-600">0</div>
                      <div className="text-gray-600">Incidents</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded text-center border border-green-200">
                      <div className="font-bold text-2xl text-green-600">0</div>
                      <div className="text-gray-600">Near Misses</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded text-center border border-blue-200">
                      <div className="font-bold text-2xl text-blue-600">156</div>
                      <div className="text-gray-600">Safe Days</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded text-center border border-blue-200">
                      <div className="font-bold text-2xl text-blue-600">5</div>
                      <div className="text-gray-600">Toolbox Talks</div>
                    </div>
                  </div>
                  
                  {/* Toolbox Talks */}
                  <div style={{ fontSize: '0.5em' }}>
                    <h3 className="font-semibold text-gray-800 mb-2">Toolbox Talk Topics</h3>
                    <ul className="space-y-1 text-gray-600">
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Excavation & Trenching Safety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Cold Weather Work Precautions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Heavy Equipment Awareness</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Slip, Trip & Fall Prevention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>PPE Inspection & Compliance</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Notes */}
                  <div className="mt-4 p-3 bg-gray-50 rounded" style={{ fontSize: '0.45em' }}>
                    <h3 className="font-semibold text-gray-800 mb-1">Safety Notes</h3>
                    <p className="text-gray-600 leading-relaxed">
                      All personnel maintained 100% PPE compliance this week. Daily site inspections conducted with no deficiencies noted.
                      Underground utility locates verified prior to all excavation activities.
                    </p>
                  </div>
                </div>
              </Page>
            )}

          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Properties</div>
            <Settings size={12} className="text-gray-400" />
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
            <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-center gap-1.5 text-teal-700">
                {(() => {
                  const Icon = sections.find(s => s.id === selectedSection)?.icon || FileText;
                  return <Icon size={12} />;
                })()}
                <span className="font-medium text-xs">{sections.find(s => s.id === selectedSection)?.label}</span>
              </div>
              <p className="text-xs text-teal-600 mt-0.5">Section • {selectedSection === 'cover' ? 'Required' : 'Optional'}</p>
            </div>

            <div>
              <div className="py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Typography <ChevronDown size={12} />
              </div>
              <div className="mt-1.5 space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Title Font</label>
                  <select className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                    <option>Inter</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Size</label>
                    <select className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                      <option>24px</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Weight</label>
                    <select className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                      <option>Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Layout <ChevronDown size={12} />
              </div>
              <div className="mt-1.5 space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Content Padding</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['16', '16', '16', '16'].map((val, i) => (
                      <input key={i} type="text" defaultValue={val} className="w-full px-1 py-1 border border-gray-200 rounded text-xs text-center" />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-0.5 text-center">
                    <span className="text-xs text-gray-400">T</span>
                    <span className="text-xs text-gray-400">R</span>
                    <span className="text-xs text-gray-400">B</span>
                    <span className="text-xs text-gray-400">L</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Colors <ChevronDown size={12} />
              </div>
              <div className="mt-1.5 space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Accent Color</label>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded border border-gray-200" style={{ background: '#008B8B' }} />
                    <input type="text" value="#008B8B" className="flex-1 px-1.5 py-1 border border-gray-200 rounded text-xs font-mono" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 border-t border-gray-100">
            <button className="w-full py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
