import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter } from 'lucide-react'

const TaskFilters = ({ statusFilter, priorityFilter, onStatusChange, onPriorityChange }) => {
  const statusOptions = ['All', 'Pending', 'Completed']
  const priorityOptions = ['All', 'Low', 'Medium', 'High']

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Status:</span>
        {statusOptions.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status)}
            className={statusFilter === status ? 'bg-clickup-purple hover:bg-clickup-purple/90 text-white' : ''}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Priority:</span>
        {priorityOptions.map((priority) => {
          const getPriorityColor = (p) => {
            if (p === 'High') return priorityFilter === priority ? 'bg-clickup-red hover:bg-clickup-red/90 text-white' : 'border-clickup-red text-clickup-red hover:bg-red-50'
            if (p === 'Medium') return priorityFilter === priority ? 'bg-clickup-yellow hover:bg-clickup-yellow/90 text-white' : 'border-clickup-yellow text-clickup-yellow hover:bg-yellow-50'
            if (p === 'Low') return priorityFilter === priority ? 'bg-clickup-green hover:bg-clickup-green/90 text-white' : 'border-clickup-green text-clickup-green hover:bg-green-50'
            return ''
          }
          return (
            <Button
              key={priority}
              variant={priorityFilter === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPriorityChange(priority)}
              className={getPriorityColor(priority)}
            >
              {priority}
            </Button>
          )
        })}
      </div>

      {(statusFilter !== 'All' || priorityFilter !== 'All') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onStatusChange('All')
            onPriorityChange('All')
          }}
          className="text-xs"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

export default TaskFilters

