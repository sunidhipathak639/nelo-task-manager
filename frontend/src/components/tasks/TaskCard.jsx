import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const TaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'destructive' // Red
      case 'Medium':
        return 'warning' // Yellow/Orange
      case 'Low':
        return 'success' // Green
      default:
        return 'default'
    }
  }

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    return status === 'Completed' ? 'success' : 'info'
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false
    try {
      return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
    } catch {
      return false
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-clickup-purple cursor-grab active:cursor-grabbing group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-lg text-gray-900 group-hover:text-clickup-purple transition-colors ${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {isOverdue(task.due_date, task.status) && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={`${getPriorityBgColor(task.priority)} border font-medium`}>
            {task.priority}
          </Badge>
          <Badge variant={getStatusColor(task.status)} className="font-medium">
            {task.status}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
            <Calendar className="h-4 w-4 text-clickup-blue" />
            <span className="font-medium">{formatDate(task.due_date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(task.id)}
            className="flex-1"
          >
            {task.status === 'Completed' ? (
              <>
                <Circle className="h-4 w-4 mr-2" />
                Mark Pending
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard

