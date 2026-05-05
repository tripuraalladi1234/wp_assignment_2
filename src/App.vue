<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Use the local MongoDB Express backend
// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const API_URL = `${API_BASE_URL}/employees`


const employees = ref([])
const employee = ref({
  name: '',
  designation: '',
  department: '',
  salary: ''
})
const isEditing = ref(false)
const editId = ref(null)

const fetchEmployees = async () => {
  try {
    const response = await axios.get(API_URL)
    console.log('API Response:', response.data)
    employees.value = response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const saveEmployee = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`${API_URL}/${editId.value}`, employee.value)
      isEditing.value = false
      editId.value = null
    } else {
      await axios.post(API_URL, employee.value)
    }
    employee.value = { name: '', designation: '', department: '', salary: '' }
    fetchEmployees()
  } catch (error) {
    console.error('Error saving employee:', error)
    alert('Failed to save. Please make sure the API is configured correctly.')
  }
}

const editEmployee = (emp) => {
  employee.value = { 
    ...emp,
    name: emp.name || emp.fullname || ''
  }
  isEditing.value = true
  editId.value = emp.id
}

const deleteEmployee = async (id) => {
  if (confirm('Are you sure you want to delete this employee?')) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editId.value = null
  employee.value = { name: '', designation: '', department: '', salary: '' }
}

onMounted(() => {
  fetchEmployees()
})
</script>

<template>
  <div class="container py-3">
    <div class="text-center mb-3 mb-md-4">
      <h1 class="fw-bold text-primary" style="font-size: clamp(2rem, 5vw, 3.5rem);">Employee Management System</h1>
      <p class="lead text-muted fs-6 fs-md-5">Manage your employee records efficiently</p>
    </div>
    
    <div class="card mb-5 shadow-lg border-0 rounded-lg">
      <div class="card-header bg-primary text-white py-3">
        <h5 class="mb-0 fw-semibold"><i class="bi bi-person-lines-fill me-2"></i>{{ isEditing ? 'Edit Employee Details' : 'Add New Employee' }}</h5>
      </div>
      <div class="card-body p-3 p-md-4 bg-light">
        <form @submit.prevent="saveEmployee">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Full Name</label>
              <input type="text" class="form-control form-control-lg border-0 shadow-sm" placeholder="e.g. John Doe" v-model="employee.name" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Designation</label>
              <input type="text" class="form-control form-control-lg border-0 shadow-sm" placeholder="e.g. Software Engineer" v-model="employee.designation" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Department</label>
              <input type="text" class="form-control form-control-lg border-0 shadow-sm" placeholder="e.g. IT" v-model="employee.department" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold text-secondary">Salary (₹)</label>
              <input type="number" class="form-control form-control-lg border-0 shadow-sm" placeholder="e.g. 50000" v-model="employee.salary" required>
            </div>
          </div>
          <div class="mt-4 d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="button" class="btn btn-outline-secondary btn-lg px-4 shadow-sm" v-if="isEditing" @click="cancelEdit">Cancel</button>
            <button type="submit" class="btn btn-primary btn-lg px-4 shadow-sm">{{ isEditing ? 'Update Employee' : 'Save Employee' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card shadow-lg border-0 rounded-lg overflow-hidden">
      <div class="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-semibold">Employee Directory</h5>
        <span class="badge bg-primary rounded-pill fs-6">{{ employees.length }} Records</span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-secondary">
              <tr>
                <th class="ps-4">ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Salary</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.id">
                <td class="ps-4 fw-bold text-muted">#{{ emp.id }}</td>
                <td class="fw-semibold">{{ emp.name || emp.fullname }}</td>
                <td><span class="badge bg-info text-dark rounded-pill px-3">{{ emp.designation }}</span></td>
                <td>{{ emp.department }}</td>
                <td class="fw-medium text-success">₹{{ emp.salary }}</td>
                <td class="text-center pe-4">
                  <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary px-3 shadow-sm" @click="editEmployee(emp)">Edit</button>
                    <button class="btn btn-sm btn-outline-danger px-3 shadow-sm" @click="deleteEmployee(emp.id)">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="employees.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="text-muted">
                    <h5 class="mt-3">No Employees Found</h5>
                    <p>Start by adding a new employee above.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
  font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}
</style>
