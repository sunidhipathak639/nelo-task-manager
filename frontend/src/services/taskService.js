import api from './api'

export const taskService = {
  // Get all tasks with optional filters
  async getTasks(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)

      const response = await api.get(`/tasks?${params.toString()}`)
      return { success: true, tasks: response.data.tasks || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tasks'
      }
    }
  },

  // Get single task
  async getTask(id) {
    try {
      const response = await api.get(`/tasks/${id}`)
      return { success: true, task: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch task'
      }
    }
  },

  // Create task
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData)
      return { success: true, task: response.data.task || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create task'
      }
    }
  },

  // Update task
  async updateTask(id, taskData) {
    try {
      const response = await api.put(`/tasks/${id}`, taskData)
      return { success: true, task: response.data.task || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update task'
      }
    }
  },

  // Delete task
  async deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete task'
      }
    }
  },

  // Toggle task status
  async toggleTaskStatus(id) {
    try {
      const response = await api.patch(`/tasks/${id}/toggle`)
      return { success: true, task: response.data.task || response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to toggle task status'
      }
    }
  }
}

