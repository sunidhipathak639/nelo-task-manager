const pool = require('../config/database');

/**
 * Get all tasks for authenticated user
 * GET /api/tasks
 * Query params: status, priority, search
 */
const getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, priority, search } = req.query;

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    // Apply status filter
    if (status && (status === 'Pending' || status === 'Completed')) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Apply priority filter
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Apply search filter (case-insensitive)
    if (search && search.trim()) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Order by created_at descending (newest first)
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      tasks: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching tasks' 
    });
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching task' 
    });
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;
    const userId = req.userId;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }

    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be Low, Medium, or High' 
      });
    }

    if (!due_date) {
      return res.status(400).json({ 
        error: 'Due date is required' 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      return res.status(400).json({ 
        error: 'Due date must be in YYYY-MM-DD format' 
      });
    }

    // Validate title length
    if (title.trim().length > 200) {
      return res.status(400).json({ 
        error: 'Title must be 200 characters or less' 
      });
    }

    // Insert task into database
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending')
       RETURNING *`,
      [userId, title.trim(), description?.trim() || null, priority, due_date]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating task' 
    });
  }
};

/**
 * Update a task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, status } = req.body;
    const userId = req.userId;

    // Check if task exists and belongs to user
    const existingTask = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Validation
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ 
          error: 'Title cannot be empty' 
        });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({ 
          error: 'Title must be 200 characters or less' 
        });
      }
    }

    if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be Low, Medium, or High' 
      });
    }

    if (status !== undefined && !['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be Pending or Completed' 
      });
    }

    if (due_date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(due_date)) {
        return res.status(400).json({ 
          error: 'Due date must be in YYYY-MM-DD format' 
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description?.trim() || null);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(due_date);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause parameters
    values.push(id, userId);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating task' 
    });
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if task exists and belongs to user
    const existingTask = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Delete task
    await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      error: 'Internal server error while deleting task' 
    });
  }
};

/**
 * Toggle task status (Pending <-> Completed)
 * PATCH /api/tasks/:id/toggle
 */
const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if task exists and belongs to user
    const existingTask = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    const currentStatus = existingTask.rows[0].status;
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';

    // Update task status
    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [newStatus, id, userId]
    );

    res.json({
      message: `Task marked as ${newStatus}`,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle task status error:', error);
    res.status(500).json({ 
      error: 'Internal server error while toggling task status' 
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus
};
