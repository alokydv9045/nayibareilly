const axios = require('axios');

async function testBypass() {
  try {
    const verifyRes = await axios.post('http://localhost:4001/api/v1/auth/verify-otp', {
      phone: '6395707468',
      otp: '999999' // Dummy OTP
    });
    console.log('Verify OTP Success:', verifyRes.data);
  } catch (error) {
    console.error('Verify OTP Error:', error.response?.data || error.message);
  }
}

testBypass();
