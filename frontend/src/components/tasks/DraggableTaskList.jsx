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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Inbox, GripVertical, Sparkles } from 'lucide-react'

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
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 0.95 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="relative group"
    >
      {/* Drag Handle */}
      <div 
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 p-1 rounded hover:bg-gray-100"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </div>
  )
}

const DraggableTaskList = ({ tasks, onEdit, onDelete, onToggle, onReorder }) => {
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-clickup-purple/20 to-clickup-blue/20 rounded-full blur-xl"></div>
            <Inbox className="h-20 w-20 text-gray-400 relative z-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No tasks found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Get started by creating your first task. Click the "New Task" button above to begin!
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>Drag and drop to reorder tasks</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over.id)
      const newTasks = arrayMove(tasks, oldIndex, newIndex)
      onReorder(newTasks)
    }

    setActiveId(null)
  }

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-clickup-purple/10 text-clickup-purple border-clickup-purple/20 font-semibold">
            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
          </Badge>
          <span className="text-sm text-gray-500">Drag to reorder</span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                <SortableTaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              </div>
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-95 rotate-2 scale-105 shadow-2xl ring-4 ring-clickup-purple/20 rounded-lg">
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

export default DraggableTaskList

