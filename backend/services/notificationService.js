const pool = require('../config/database');
const emailService = require('./emailService');

const checkPendingTasks = async () => {
  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, email FROM users');
    const users = usersResult.rows;
    
    for (const user of users) {
      // Get pending tasks for user
      const tasksResult = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 AND status = $2',
        [user.id, 'Pending']
      );
      
      const pendingTasks = tasksResult.rows;
      
      if (pendingTasks.length > 0) {
        // Generate email content
        const emailContent = generateEmailContent(pendingTasks);
        
        // Log notification (mock)
        console.log('📧 Task Reminder Notification:', {
          to: user.email,
          subject: 'Pending Tasks Reminder',
          taskCount: pendingTasks.length,
          tasks: pendingTasks.map(t => ({
            title: t.title,
            dueDate: t.due_date,
            priority: t.priority
          }))
        });
        
        // In production: Send actual email
        // await emailService.sendEmail(user.email, 'Pending Tasks Reminder', emailContent);
      }
    }
  } catch (error) {
    console.error('Notification service error:', error);
  }
};

const generateEmailContent = (tasks) => {
  let content = '<h2>You have pending tasks:</h2><ul>';
  tasks.forEach(task => {
    content += `<li>${task.title} - Due: ${task.due_date} - Priority: ${task.priority}</li>`;
  });
  content += '</ul>';
  return content;
};

// Run every 20 minutes (20 * 60 * 1000 ms)
const startNotificationService = () => {
  // Run immediately on start
  checkPendingTasks();
  
  // Then run every 20 minutes
  setInterval(() => {
    checkPendingTasks();
  }, 20 * 60 * 1000);
  
  console.log('✅ Task notification service started (runs every 20 minutes)');
};

module.exports = {
  startNotificationService,
  checkPendingTasks
};

