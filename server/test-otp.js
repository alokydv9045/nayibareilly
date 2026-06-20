const axios = require('axios');

async function testOtp() {
  try {
    // 1. Request OTP
    const reqRes = await axios.post('http://localhost:4001/api/v1/auth/request-otp', {
      phone: '6395707468',
      name: 'Test User'
    });
    console.log('Request OTP:', reqRes.data);
    const otp = reqRes.data.data.otp;

    // 2. Verify OTP
    const verifyRes = await axios.post('http://localhost:4001/api/v1/auth/verify-otp', {
      phone: '6395707468',
      otp: otp
    });
    console.log('Verify OTP:', verifyRes.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testOtp();
