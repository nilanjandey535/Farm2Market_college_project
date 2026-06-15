// Test script for admin registration
const axios = require('axios');

async function testAdminRegistration() {
  try {

    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:4000/api/health');
    console.log('Health Response:', healthResponse.data);

    console.log('Testing admin registration...');
    const response = await axios.post('http://localhost:4000/api/register/admin', {
      admin_name: 'Test Admin',
      email: 'test@admin.com',
      phone: '1234567890',
      password: '1234',
      role_type: 'admin'
    });

    console.log('Admin Registration Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAdminRegistration();
