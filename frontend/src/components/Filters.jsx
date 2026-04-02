import { memo } from 'react'

const METRIC_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'cpu', label: 'CPU' },
  { value: 'memory', label: 'Memory' },
  { value: 'disk', label: 'Disk' },
]

function Filters({ filters, onFilterChange, services = [] }) {
  const uniqueServices = [...new Set(services.map((m) => m.service_name))]

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wide">
          Service
        </label>
        <select
          value={filters.service_name || ''}
          onChange={(e) => onFilterChange('service_name', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     min-w-[160px]"
        >
          <option value="">All Services</option>
          {uniqueServices.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wide">
          Metric Type
        </label>
        <select
          value={filters.metric_type || ''}
          onChange={(e) => onFilterChange('metric_type', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     min-w-[140px]"
        >
          {METRIC_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wide">
          Limit
        </label>
        <select
          value={filters.limit || 50}
          onChange={(e) => onFilterChange('limit', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     min-w-[100px]"
        >
          <option value={25}>25 points</option>
          <option value={50}>50 points</option>
          <option value={100}>100 points</option>
        </select>
      </div>
    </div>
  )
}

export default memo(Filters)
