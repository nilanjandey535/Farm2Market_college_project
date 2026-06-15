// Test script to verify admin registration endpoint
const API_URL = 'http://localhost:4000/api/register';

async function testEndpoints() {
  console.log('🧪 Testing Admin Registration Endpoints\n');

  console.log('Test 1: Checking if super admin exists...');
  try {
    const response = await fetch(`${API_URL}/admin/check-super-admin`);
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success:', result);
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('   Make sure the backend server is running on port 4000');
  }

  console.log('\n---\n');

}

testEndpoints();
