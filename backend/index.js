const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store for tasks
let tasks = [
  { id: 1, title: 'Learn Kubernetes', completed: false },
  { id: 2, title: 'Build Task Tracker App', completed: false }
];

// Routes
// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: req.body.title,
    completed: req.body.completed || false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.title = req.body.title !== undefined ? req.body.title : task.title;
  task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
  
  res.json(task);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
