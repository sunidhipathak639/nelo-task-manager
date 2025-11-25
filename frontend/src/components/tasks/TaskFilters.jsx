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
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Priority:</span>
        {priorityOptions.map((priority) => (
          <Button
            key={priority}
            variant={priorityFilter === priority ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPriorityChange(priority)}
          >
            {priority}
          </Button>
        ))}
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

