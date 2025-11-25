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
import { GridSkeleton, KanbanSkeleton, DashboardHeaderSkeleton, FiltersSkeleton } from '@/components/common/SkeletonLoader'
import { taskService } from '@/services/taskService'
import { authService } from '@/services/authService'
import { getSession } from '@/utils/sessionStorage'
import { Plus, LogOut, Loader2, LayoutGrid, Columns3, Filter, Search, X, AlertCircle, User, Sun, Moon } from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useTheme } from '@/contexts/ThemeContext'
import { Switch } from '@/components/ui/switch'
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
  const [userInfo, setUserInfo] = useState(null)
  const [notifications, setNotifications] = useState([])
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = getSession()
    if (!token) {
      navigate('/login')
      return
    }

    fetchUserInfo()
    fetchTasks()
    initializeNotifications()
  }, [navigate])

  const initializeNotifications = () => {
    if (tasks.length === 0) {
      setNotifications([])
      return
    }

    const newNotifications = []

    // Check for overdue tasks
    tasks.forEach(task => {
      if (task.status === 'Completed') return
      
      try {
        const dueDate = new Date(task.due_date)
        const now = new Date()
        if (dueDate < now && dueDate.toDateString() !== now.toDateString()) {
          newNotifications.push({
            id: `overdue-${task.id}`,
            type: 'task_due',
            title: 'Task Overdue',
            message: `"${task.title}" is overdue`,
            read: false,
            createdAt: task.due_date || new Date().toISOString(),
            taskId: task.id
          })
        }
      } catch {
        // Skip invalid dates
      }
    })

    // Add task completion notifications
    tasks.forEach(task => {
      if (task.status === 'Completed') {
        newNotifications.push({
          id: `completed-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          message: `"${task.title}" has been completed`,
          read: false,
          createdAt: task.updated_at || task.created_at || new Date().toISOString(),
          taskId: task.id
        })
      }
    })

    // Sort by date (newest first)
    newNotifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )

    setNotifications(newNotifications)
  }

  useEffect(() => {
    if (tasks.length > 0) {
      initializeNotifications()
    }
  }, [tasks])

  const fetchUserInfo = async () => {
    try {
      const result = await authService.verify()
      if (result.success) {
        setUserInfo(result.user)
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err)
    }
  }

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
        // Add notification for new task
        const newNotification = {
          id: `task-${Date.now()}`,
          type: 'task_created',
          title: 'New Task Created',
          message: `"${taskData.title}" has been created`,
          read: false,
          createdAt: new Date().toISOString(),
          taskId: result.task?.id
        }
        setNotifications(prev => [newNotification, ...prev])
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
      const task = tasks.find(t => t.id === taskId)
      const result = await taskService.toggleTaskStatus(taskId)
      
      if (result.success) {
        await fetchTasks()
        // Add notification for status change
        const newStatus = task?.status === 'Pending' ? 'Completed' : 'Pending'
        const newNotification = {
          id: `status-${taskId}-${Date.now()}`,
          type: newStatus === 'Completed' ? 'task_completed' : 'task_created',
          title: newStatus === 'Completed' ? 'Task Completed' : 'Task Reopened',
          message: `"${task?.title}" has been marked as ${newStatus.toLowerCase()}`,
          read: false,
          createdAt: new Date().toISOString(),
          taskId: taskId
        }
        setNotifications(prev => [newNotification, ...prev])
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

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header - Enhanced with User Info */}
        {loading ? (
          <DashboardHeaderSkeleton />
        ) : (
          <Card className="mb-4 sm:mb-6 border-2 shadow-xl bg-white/95 dark:bg-gray-800/95 dark:border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left Section - Title & Description */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-clickup-purple to-clickup-blue rounded-xl shadow-lg">
                      <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-clickup-purple via-clickup-blue to-clickup-teal bg-clip-text text-transparent">
                        Task Dashboard
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-1.5 text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span>Welcome back{userInfo?.name ? `, ${userInfo.name.split(' ')[0]}` : ''}!</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'shown' : 'shown'}</span>
                      </CardDescription>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions & User */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50/50 dark:bg-gray-800/50">
                    <Button
                      variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                      className={`${viewMode === 'kanban' ? 'bg-clickup-purple hover:bg-clickup-purple/90 text-white shadow-md' : 'hover:bg-white dark:hover:bg-gray-800'} transition-all duration-200 text-xs sm:text-sm`}
                    >
                      <Columns3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Kanban</span>
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`${viewMode === 'grid' ? 'bg-clickup-purple hover:bg-clickup-purple/90 text-white shadow-md' : 'hover:bg-white dark:hover:bg-gray-800'} transition-all duration-200 text-xs sm:text-sm`}
                    >
                      <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Grid</span>
                    </Button>
                  </div>

                  {/* New Task Button */}
                  <Button 
                    onClick={openCreateDialog} 
                    className="gap-1 sm:gap-2 bg-gradient-to-r from-clickup-purple to-clickup-blue hover:from-clickup-purple/90 hover:to-clickup-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-xs sm:text-sm px-2 sm:px-4"
                    size="sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">New Task</span>
                    <span className="sm:hidden">New</span>
                  </Button>

                  {/* Notifications Bell */}
                  <NotificationBell
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onClearAll={handleClearAllNotifications}
                  />

                  {/* Theme Toggle Switch */}
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Sun className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-clickup-purple scale-90 sm:scale-100"
                    />
                    <Moon className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
                  </div>

                  {/* User Info & Logout - Compact */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* User Avatar & Info */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-clickup-purple to-clickup-blue flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        {userInfo?.name ? (
                          userInfo.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {userInfo?.name?.split(' ')[0] || 'User'}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight truncate max-w-[120px]">
                          {userInfo?.email || 'user@example.com'}
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <Button 
                      variant="outline" 
                      onClick={handleLogout} 
                      className="gap-1 sm:gap-2 border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
                      size="sm"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search - Enhanced Professional Design */}
        {loading ? (
          <FiltersSkeleton />
        ) : (
          <Card className="mb-4 sm:mb-6 border-2 shadow-lg bg-white/95 dark:bg-gray-800/95 dark:border-gray-700 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-clickup-purple/10 via-clickup-blue/10 to-clickup-teal/10 border-b-2 border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-clickup-purple/10 rounded-lg">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-clickup-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-clickup-purple to-clickup-blue bg-clip-text text-transparent">
                      Search & Filter
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-clickup-red hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                    Active Filters:
                  </Badge>
                  {statusFilter !== 'All' && (
                    <Badge className="bg-clickup-purple/10 dark:bg-clickup-purple/20 text-clickup-purple dark:text-clickup-purple-300 border-clickup-purple/20 dark:border-clickup-purple/40 text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {priorityFilter !== 'All' && (
                    <Badge className="bg-clickup-yellow/10 dark:bg-clickup-yellow/20 text-clickup-yellow dark:text-clickup-yellow-300 border-clickup-yellow/20 dark:border-clickup-yellow/40 text-xs">
                      Priority: {priorityFilter}
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge className="bg-clickup-blue/10 dark:bg-clickup-blue/20 text-clickup-blue dark:text-clickup-blue-300 border-clickup-blue/20 dark:border-clickup-blue/40 text-xs">
                      Search: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tasks List with Drag and Drop */}
        {loading ? (
          viewMode === 'kanban' ? (
            <KanbanSkeleton />
          ) : (
            <GridSkeleton />
          )
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
