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
import { Inbox, CheckCircle2 } from 'lucide-react'

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
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
      className="flex flex-col h-full min-h-[600px] border-2 transition-all hover:shadow-lg"
    >
      <CardHeader className={`bg-gradient-to-r ${id === 'Pending' ? 'from-blue-50 border-blue-200' : 'from-green-50 border-green-200'} to-transparent border-b-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <CardTitle className="text-lg font-bold text-gray-800">{title}</CardTitle>
            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
              {tasks.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[400px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <Inbox className="h-12 w-12 text-gray-400 mb-3 opacity-50" />
                <p className="text-sm text-gray-500 font-medium">
                  Drop tasks here
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
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

  return (
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
          <div className="opacity-95 rotate-3 scale-105 shadow-2xl">
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
  )
}

export default KanbanBoard

