
const schoolId = 1; // Assuming school ID 1 exists
const students = [
  { studentName: 'API Test Student', grade: '1', class: '1', birthDate: '20100101', phoneNumber: '010-0000-0000' }
];

async function testApi() {
  try {
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, students })
    });
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    process.exit(response.ok ? 0 : 1);
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  }
}

testApi();
