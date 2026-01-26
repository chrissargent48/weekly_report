import { Config } from "@puckeditor/core";

export type PuckData = {
  content: any[];
  root: any;
};

export const puckConfig: Config = {
  components: {
    CoverPage: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        weekEnding: { type: "text" },
        location: { type: "text" },
      },
      render: ({ title, subtitle, weekEnding, location }) => (
        <div className="p-12 border-b-4 border-blue-600 bg-white min-h-[400px] flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">{title}</h1>
          <h2 className="text-xl text-blue-600 font-semibold mb-8">{subtitle}</h2>
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div>
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Week Ending</p>
              <p className="text-lg font-medium text-gray-800">{weekEnding}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Location</p>
              <p className="text-lg font-medium text-gray-800">{location}</p>
            </div>
          </div>
        </div>
      ),
    },
    RichText: {
      fields: {
        title: { type: "text" },
        content: { type: "textarea" },
      },
      render: ({ title, content }) => (
        <div className="p-8 bg-white mb-4">
          {title && <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b uppercase tracking-wide">{title}</h3>}
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
        </div>
      ),
    },
    WeatherTable: {
      fields: {
        days: {
          type: "array",
          arrayFields: {
            date: { type: "text" },
            condition: { type: "text" },
            hoursLost: { type: "number" },
            tempHigh: { type: "number" },
            tempLow: { type: "number" },
          }
        }
      },
      render: ({ days = [] }) => (
        <div className="p-8 bg-white mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b uppercase tracking-wide">Weather Conditions</h3>
          <div className="overflow-x-auto border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Temp (H/L)</th>
                  <th className="px-4 py-3">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {days.map((day: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{day.date}</td>
                    <td className="px-4 py-3">{day.condition}</td>
                    <td className="px-4 py-3">{day.tempHigh}° / {day.tempLow}°</td>
                    <td className="px-4 py-3">
                      {day.hoursLost > 0 ? (
                        <span className="text-red-600 font-bold">{day.hoursLost} hrs lost</span>
                      ) : (
                        <span className="text-green-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    PhotoGrid: {
      fields: {
        photos: {
          type: "array",
          arrayFields: {
            url: { type: "text" },
            caption: { type: "text" },
          }
        }
      },
      render: ({ photos = [] }) => (
        <div className="p-8 bg-white mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b uppercase tracking-wide">Project Photos</h3>
          <div className="grid grid-cols-2 gap-6">
            {photos.map((photo: any, i: number) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border shadow-sm transition-all hover:shadow-md">
                <img src={photo.url} alt={photo.caption} className="w-full h-48 object-cover" />
                <div className="p-4 bg-gray-50 border-t group-hover:bg-white transition-colors">
                  <p className="text-xs text-gray-600 font-medium">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    TableSection: {
      fields: {
        title: { type: "text" },
        headers: { type: "array", arrayFields: { label: { type: "text" } } },
        rows: { type: "array", arrayFields: { cells: { type: "array", arrayFields: { value: { type: "text" } } } } },
      },
      render: ({ title, headers = [], rows = [] }) => (
        <div className="p-8 bg-white mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b uppercase tracking-wide">{title}</h3>
          <div className="overflow-x-auto border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1e293b] text-white uppercase text-[10px] font-bold tracking-widest border-b border-[#0f172a]">
                <tr>
                  {headers.map((h: any, i: number) => (
                    <th key={i} className="px-4 py-4">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {rows.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {row.cells?.map((cell: any, j: number) => (
                      <td key={j} className="px-4 py-4 text-gray-700 border-r last:border-r-0 border-gray-100">
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  },
};
