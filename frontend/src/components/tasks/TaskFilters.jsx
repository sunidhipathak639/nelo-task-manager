import { Button } from '@/components/ui/button'

const TaskFilters = ({ statusFilter, priorityFilter, onStatusChange, onPriorityChange }) => {
  const statusOptions = ['All', 'Pending', 'Completed']

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((status) => {
        const getStatusColor = (s) => {
          if (s === 'Pending') return statusFilter === status 
            ? 'bg-clickup-blue hover:bg-clickup-blue/90 text-white shadow-md' 
            : 'border-clickup-blue text-clickup-blue hover:bg-blue-50 hover:border-clickup-blue'
          if (s === 'Completed') return statusFilter === status 
            ? 'bg-clickup-green hover:bg-clickup-green/90 text-white shadow-md' 
            : 'border-clickup-green text-clickup-green hover:bg-green-50 hover:border-clickup-green'
          return statusFilter === status 
            ? 'bg-gray-700 hover:bg-gray-800 text-white shadow-md' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }
        return (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status)}
            className={`${getStatusColor(status)} transition-all duration-200 font-medium`}
          >
            {status}
          </Button>
        )
      })}
    </div>
  )
}

export default TaskFilters

