import TaskCard from './TaskCard'
import { Card, CardContent } from '@/components/ui/card'
import { Inbox } from 'lucide-react'

const TaskList = ({ tasks, onEdit, onDelete, onToggle }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No tasks found
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Create your first task to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

export default TaskList

