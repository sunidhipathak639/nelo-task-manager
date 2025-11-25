import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import TaskForm from '@/components/tasks/TaskForm'
import TaskList from '@/components/tasks/TaskList'
import DraggableTaskList from '@/components/tasks/DraggableTaskList'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskSearch from '@/components/tasks/TaskSearch'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { taskService } from '@/services/taskService'
import { authService } from '@/services/authService'
import { getSession } from '@/utils/sessionStorage'
import { Plus, LogOut, Loader2, LayoutGrid, Columns3, Filter, Search, X, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'grid'
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = getSession()
    if (!token) {
      navigate('/login')
      return
    }

    fetchTasks()
  }, [navigate])

  useEffect(() => {
    filterTasks()
  }, [tasks, statusFilter, priorityFilter, searchTerm])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all tasks (server-side filtering can be added later if needed)
      const result = await taskService.getTasks()
      
      if (result.success) {
        setTasks(result.tasks)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    // Apply search filter (client-side for better UX)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      )
    }

    setFilteredTasks(filtered)
  }

  const handleCreateTask = async (taskData) => {
    try {
      const result = await taskService.createTask(taskData)
      
      if (result.success) {
        setIsTaskFormOpen(false)
        await fetchTasks()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to create task. Please try again.')
    }
  }

  const handleEditTask = async (taskData) => {
    try {
      const result = await taskService.updateTask(editingTask.id, taskData)
      
      if (result.success) {
        setIsTaskFormOpen(false)
        setEditingTask(null)
        await fetchTasks()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      const result = await taskService.deleteTask(taskToDelete)
      
      if (result.success) {
        setDeleteDialogOpen(false)
        setTaskToDelete(null)
        await fetchTasks()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to delete task. Please try again.')
    }
  }

  const handleToggleStatus = async (taskId) => {
    try {
      const result = await taskService.toggleTaskStatus(taskId)
      
      if (result.success) {
        await fetchTasks()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update task status. Please try again.')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // If status is changing, use toggle or update
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        // If toggling between Pending and Completed
        if ((task.status === 'Pending' && newStatus === 'Completed') ||
            (task.status === 'Completed' && newStatus === 'Pending')) {
          await handleToggleStatus(taskId)
        } else {
          // Direct status update
          const result = await taskService.updateTask(taskId, { status: newStatus })
          if (result.success) {
            await fetchTasks()
          } else {
            setError(result.error)
          }
        }
      }
    } catch (err) {
      setError('Failed to update task status. Please try again.')
    }
  }

  const handleReorder = async (newTasks) => {
    // Update local state immediately for smooth UX
    setTasks(newTasks)
    // Optionally save order to backend if you add an order field
  }

  const handleLogout = () => {
    authService.logout()
  }

  const openCreateDialog = () => {
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }

  const openEditDialog = (task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const openDeleteDialog = (taskId) => {
    setTaskToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-6 border-2 shadow-lg bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-clickup-purple via-clickup-blue to-clickup-teal bg-clip-text text-transparent">
                  Task Dashboard
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Drag and drop to reorder • Manage your tasks efficiently
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={viewMode === 'kanban' ? 'bg-clickup-purple hover:bg-clickup-purple/90 text-white' : ''}
                  >
                    <Columns3 className="h-4 w-4 mr-1" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-clickup-purple hover:bg-clickup-purple/90 text-white' : ''}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                </div>
                <Button 
                  onClick={openCreateDialog} 
                  className="gap-2 bg-clickup-purple hover:bg-clickup-purple/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2 border-gray-300 hover:bg-gray-50">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search - Enhanced Professional Design */}
        <Card className="mb-6 border-2 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-clickup-purple/10 via-clickup-blue/10 to-clickup-teal/10 border-b-2 border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-clickup-purple/10 rounded-lg">
                  <Filter className="h-5 w-5 text-clickup-purple" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-clickup-purple to-clickup-blue bg-clip-text text-transparent">
                    Search & Filter
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    Find and organize your tasks efficiently
                  </CardDescription>
                </div>
              </div>
              {(statusFilter !== 'All' || priorityFilter !== 'All' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('All')
                    setPriorityFilter('All')
                    setSearchTerm('')
                  }}
                  className="text-xs text-gray-600 hover:text-clickup-red hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4 text-clickup-blue" />
                Search Tasks
              </Label>
              <TaskSearch onSearch={setSearchTerm} />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-clickup-purple" />
                  Status Filter
                </Label>
                <TaskFilters
                  statusFilter={statusFilter}
                  priorityFilter={priorityFilter}
                  onStatusChange={setStatusFilter}
                  onPriorityChange={setPriorityFilter}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-clickup-yellow" />
                  Priority Filter
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Low', 'Medium', 'High'].map((priority) => {
                    const getPriorityColor = (p) => {
                      if (p === 'High') return priorityFilter === priority 
                        ? 'bg-clickup-red hover:bg-clickup-red/90 text-white shadow-md' 
                        : 'border-clickup-red text-clickup-red hover:bg-red-50 hover:border-clickup-red'
                      if (p === 'Medium') return priorityFilter === priority 
                        ? 'bg-clickup-yellow hover:bg-clickup-yellow/90 text-white shadow-md' 
                        : 'border-clickup-yellow text-clickup-yellow hover:bg-yellow-50 hover:border-clickup-yellow'
                      if (p === 'Low') return priorityFilter === priority 
                        ? 'bg-clickup-green hover:bg-clickup-green/90 text-white shadow-md' 
                        : 'border-clickup-green text-clickup-green hover:bg-green-50 hover:border-clickup-green'
                      return priorityFilter === priority 
                        ? 'bg-gray-700 hover:bg-gray-800 text-white shadow-md' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                    return (
                      <Button
                        key={priority}
                        variant={priorityFilter === priority ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriorityFilter(priority)}
                        className={`${getPriorityColor(priority)} transition-all duration-200 font-medium`}
                      >
                        {priority}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Active Filters Badge */}
            {(statusFilter !== 'All' || priorityFilter !== 'All' || searchTerm) && (
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Active Filters:
                </Badge>
                {statusFilter !== 'All' && (
                  <Badge className="bg-clickup-purple/10 text-clickup-purple border-clickup-purple/20">
                    Status: {statusFilter}
                  </Badge>
                )}
                {priorityFilter !== 'All' && (
                  <Badge className="bg-clickup-yellow/10 text-clickup-yellow border-clickup-yellow/20">
                    Priority: {priorityFilter}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge className="bg-clickup-blue/10 text-clickup-blue border-clickup-blue/20">
                    Search: "{searchTerm}"
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks List with Drag and Drop */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-clickup-purple" />
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onToggle={handleToggleStatus}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <DraggableTaskList
            tasks={filteredTasks}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onToggle={handleToggleStatus}
            onReorder={handleReorder}
          />
        )}

        {/* Task Form Dialog */}
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => {
            setIsTaskFormOpen(false)
            setEditingTask(null)
          }}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          initialData={editingTask}
          mode={editingTask ? 'edit' : 'create'}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setTaskToDelete(null)
          }}
          onConfirm={handleDeleteTask}
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </div>
  )
}

export default Dashboard
