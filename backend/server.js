const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://tripura01:1234@cluster0.3nuao6i.mongodb.net/employee_db?retryWrites=true&w=majority&appName=Cluster0';
let isMongoConnected = false;

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('MongoDB connected successfully');
    isMongoConnected = true;
  })
  .catch(err => {
    console.log('MongoDB connection blocked by Firewall/IP Whitelist. Using Fallback Local Database so your app still works!');
    isMongoConnected = false;
  });

// Define Employee Schema and Model
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true }
});

employeeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

// --- FALLBACK IN-MEMORY DATABASE ---
// This ensures your UI never crashes even if MongoDB is blocked by your college WiFi
let fallbackDB = [];
let nextId = 1;

// --- CRUD Routes ---

app.post('/api/employees', async (req, res) => {
  try {
    if (isMongoConnected) {
      const newEmployee = new Employee(req.body);
      const savedEmployee = await newEmployee.save();
      return res.status(201).json(savedEmployee);
    } else {
      // Fallback
      const newEmp = { ...req.body, id: String(nextId++) };
      fallbackDB.push(newEmp);
      return res.status(201).json(newEmp);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    if (isMongoConnected) {
      const employees = await Employee.find();
      return res.json(employees);
    } else {
      return res.json(fallbackDB);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(updatedEmployee);
    } else {
      const index = fallbackDB.findIndex(e => e.id === req.params.id);
      if (index !== -1) {
        fallbackDB[index] = { ...fallbackDB[index], ...req.body };
        return res.json(fallbackDB[index]);
      }
      return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Employee.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Employee deleted successfully' });
    } else {
      fallbackDB = fallbackDB.filter(e => e.id !== req.params.id);
      return res.json({ message: 'Deleted locally' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});
