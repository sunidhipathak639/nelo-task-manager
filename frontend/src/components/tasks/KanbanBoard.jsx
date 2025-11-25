import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Inbox, CheckCircle2, Circle, Sparkles, TrendingUp, Clock } from 'lucide-react'

const SortableTaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 0.95 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </div>
  )
}

const KanbanColumn = ({ id, title, tasks, onEdit, onDelete, onToggle, icon: Icon, color }) => {
  const {
    setNodeRef,
  } = useSortable({
    id,
    data: {
      type: 'column',
      column: id,
    },
  })

  return (
    <Card 
      ref={setNodeRef} 
      className="flex flex-col h-full min-h-[650px] border-2 shadow-lg transition-all hover:shadow-xl bg-white/95 backdrop-blur-sm"
    >
      <CardHeader className={`bg-gradient-to-r ${id === 'Pending' ? 'from-blue-50 via-blue-100/50 border-blue-300' : 'from-green-50 via-green-100/50 border-green-300'} to-transparent border-b-2 pb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${id === 'Pending' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {title}
                <Badge 
                  variant="secondary" 
                  className={`${id === 'Pending' ? 'bg-blue-200 text-blue-800 border-blue-300' : 'bg-green-200 text-green-800 border-green-300'} font-bold text-sm`}
                >
                  {tasks.length}
                </Badge>
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {id === 'Pending' ? 'Tasks in progress' : 'Completed tasks'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50/30 to-transparent">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 min-h-[450px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:border-gray-400 transition-colors">
                <div className="relative mb-4">
                  <div className={`absolute inset-0 ${id === 'Pending' ? 'bg-blue-200/30' : 'bg-green-200/30'} rounded-full blur-lg`}></div>
                  <Inbox className={`h-16 w-16 ${id === 'Pending' ? 'text-blue-400' : 'text-green-400'} relative z-10`} />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {id === 'Pending' ? 'No pending tasks' : 'No completed tasks'}
                </p>
                <p className="text-xs text-gray-500">
                  {id === 'Pending' ? 'Drag tasks here to mark as pending' : 'Drag tasks here to mark as completed'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Drop tasks here</span>
                </div>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SortableTaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

const KanbanBoard = ({ tasks, onEdit, onDelete, onToggle, onStatusChange }) => {
  const [activeId, setActiveId] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Separate tasks by status
  const pendingTasks = tasks.filter((task) => task.status === 'Pending')
  const completedTasks = tasks.filter((task) => task.status === 'Completed')

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    
    // Find which column the task is in
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveColumn(task.status)
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Visual feedback when dragging over a column
    if (over.data?.current?.type === 'column') {
      const newStatus = over.data.current.column
      if (activeTask.status !== newStatus) {
        // Column will highlight when dragging over
      }
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setActiveColumn(null)
      return
    }

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) {
      setActiveId(null)
      setActiveColumn(null)
      return
    }

    // Check if dropped on a column (status change)
    if (over.data?.current?.type === 'column') {
      const newStatus = over.data.current.column
      
      if (activeTask.status !== newStatus) {
        // Change task status
        onStatusChange(activeTask.id, newStatus)
      }
    } else {
      // Reordering within the same column
      const isPendingColumn = activeTask.status === 'Pending'
      const columnTasks = isPendingColumn ? pendingTasks : completedTasks
      
      const oldIndex = columnTasks.findIndex((task) => task.id === active.id)
      const newIndex = columnTasks.findIndex((task) => task.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTasks = arrayMove(columnTasks, oldIndex, newIndex)
        // Update order (you can add order field to backend later)
      }
    }

    setActiveId(null)
    setActiveColumn(null)
  }

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null

  const totalTasks = tasks.length
  const completedCount = completedTasks.length
  const pendingCount = pendingTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Kanban Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Pending</p>
                <p className="text-2xl font-bold text-blue-700">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-700">{completedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium mb-1">Progress</p>
                <p className="text-2xl font-bold text-purple-700">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Pending Column */}
          <div className="flex flex-col">
            <KanbanColumn
              id="Pending"
              title="Pending Tasks"
              tasks={pendingTasks}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              icon={Circle}
              color="text-clickup-blue"
            />
          </div>

          {/* Completed Column */}
          <div className="flex flex-col">
            <KanbanColumn
              id="Completed"
              title="Completed Tasks"
              tasks={completedTasks}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              icon={CheckCircle2}
              color="text-clickup-green"
            />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-95 rotate-2 scale-105 shadow-2xl ring-4 ring-clickup-purple/30 rounded-lg">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggle={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default KanbanBoard

