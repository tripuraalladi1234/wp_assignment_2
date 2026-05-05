const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/employees', {
      name: 'Test',
      designation: 'Tester',
      department: 'QA',
      salary: 1000
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
