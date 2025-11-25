import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import TaskForm from '@/components/tasks/TaskForm'
import TaskList from '@/components/tasks/TaskList'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskSearch from '@/components/tasks/TaskSearch'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { taskService } from '@/services/taskService'
import { authService } from '@/services/authService'
import { getSession } from '@/utils/sessionStorage'
import { Plus, LogOut, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Task Dashboard
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage your tasks efficiently
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
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

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TaskSearch onSearch={setSearchTerm} />
            <TaskFilters
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
            />
          </CardContent>
        </Card>

        {/* Tasks List */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onToggle={handleToggleStatus}
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
