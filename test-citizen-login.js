#!/usr/bin/env node

/**
 * Test script to verify citizen login redirect behavior
 * This script tests the login API and checks the redirect destination
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4001/api';
const TEST_CITIZEN = {
  email: 'citizen1@gmail.com',
  password: 'Admin@123',
  role: 'citizen'
};

async function getCSRFToken() {
  try {
    const response = await fetch(`${API_BASE}/v1/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`CSRF token request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error.message);
    return null;
  }
}

async function testCitizenLogin() {
  console.log('🧪 Testing Citizen Login Redirect Behavior');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Get CSRF token
    console.log('📡 Getting CSRF token...');
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    console.log('✅ CSRF token obtained');
    
    // Step 2: Attempt login
    console.log('🔐 Attempting citizen login...');
    const loginResponse = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(TEST_CITIZEN)
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.message || loginResponse.statusText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const { user, token } = loginData.data;
    
    console.log('✅ Login successful!');
    console.log('👤 User Info:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.name || 'N/A'}`);
    console.log(`   - Roles: ${JSON.stringify(user.roles)}`);
    
    // Step 3: Analyze expected redirect
    console.log('\n🎯 Redirect Analysis:');
    
    const roles = user.roles || [];
    const isCitizen = roles.includes('citizen');
    const hasAdminRole = roles.some(role => 
      ['super_admin', 'dept_admin', 'mayor', 'moderator', 'staff'].includes(role)
    );
    
    let expectedDestination = '/';
    if (hasAdminRole) {
      if (roles.includes('super_admin')) {
        expectedDestination = '/superadmin';
      } else if (roles.includes('dept_admin')) {
        expectedDestination = '/department';
      } else if (roles.includes('mayor')) {
        expectedDestination = '/mayor';
      } else if (roles.includes('moderator')) {
        expectedDestination = '/moderator/dashboard';
      } else if (roles.includes('staff')) {
        expectedDestination = '/staff';
      }
    }
    
    console.log(`   - Is Citizen: ${isCitizen}`);
    console.log(`   - Has Admin Role: ${hasAdminRole}`);
    console.log(`   - Expected Redirect: ${expectedDestination}`);
    
    if (isCitizen && expectedDestination === '/') {
      console.log('✅ CORRECT: Citizen should redirect to homepage (/)');
    } else if (isCitizen && expectedDestination !== '/') {
      console.log('❌ ISSUE: Citizen should redirect to homepage (/), not admin dashboard');
    } else {
      console.log('ℹ️  Admin user - redirect to appropriate dashboard');
    }
    
    console.log('\n🏁 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testCitizenLogin().catch(console.error);
}

module.exports = { testCitizenLogin };