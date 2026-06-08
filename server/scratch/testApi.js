import http from 'http';

const PORT = 4002;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
const email = 'admin@nayibareilly.gov.in';
const password = 'Admin@123';

function request(method, endpoint, body = null, token = null, csrfToken = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (csrfToken) options.headers['X-CSRF-Token'] = csrfToken;
    if (cookie) options.headers['Cookie'] = cookie;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, setCookie });
        } catch (e) {
          resolve({ status: res.statusCode, data, setCookie });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting API Tests...');
  let token = null;
  let csrfToken = null;
  let cookie = null;

  try {
    // 0. Fetch CSRF token
    console.log('\\n[TEST 0] Fetching CSRF Token...');
    const csrfRes = await request('GET', '/auth/csrf-token');
    if (csrfRes.status !== 200) {
      console.error('Failed to fetch CSRF token', csrfRes.status, csrfRes.data);
      return;
    }
    csrfToken = csrfRes.data.data?.csrfToken || csrfRes.data?.csrfToken;
    
    if (csrfRes.setCookie && csrfRes.setCookie.length > 0) {
      cookie = csrfRes.setCookie[0].split(';')[0];
    }
    console.log('✅ CSRF Token acquired.');

    // 1. Test Login
    console.log('\\n[TEST 1] Logging in as Admin...');
    const loginRes = await request('POST', '/auth/login', { email, password }, null, csrfToken, cookie);
    if (loginRes.status !== 200) {
      console.error('Login failed!', loginRes.status, loginRes.data);
      return;
    }
    token = loginRes.data.data?.token || loginRes.data.token;
    
    // Update cookies if session is established
    if (loginRes.setCookie && loginRes.setCookie.length > 0) {
      cookie = cookie ? cookie + '; ' + loginRes.setCookie[0].split(';')[0] : loginRes.setCookie[0].split(';')[0];
    }
    console.log('✅ Login Successful. Token acquired.');

    // 2. Fetch Users
    console.log('\\n[TEST 2] Fetching Users...');
    const usersRes = await request('GET', '/admin/users?limit=5', null, token, csrfToken, cookie);
    console.log(`Status: ${usersRes.status}`);
    if (usersRes.status !== 200) console.log('❌ Failed to fetch users');
    else console.log('✅ Users fetched successfully.');

    const testUser = usersRes.data?.data?.users?.[0] || usersRes.data?.users?.[0];
    
    if (testUser) {
      // 3. Update User Roles
      console.log(`\\n[TEST 3] Updating User Roles for ${testUser.id}...`);
      const rolesRes = await request('PATCH', `/admin/users/${testUser.id}/roles`, { roles: ['citizen'] }, token, csrfToken, cookie);
      console.log(`Status: ${rolesRes.status}`);
      if (rolesRes.status !== 200) console.log('❌ Roles update failed:', rolesRes.data);
      else console.log('✅ Roles updated successfully.');

      // 4. Activate User
      console.log(`\\n[TEST 4] Activating User ${testUser.id}...`);
      const activateRes = await request('PATCH', `/admin/users/${testUser.id}/activate`, null, token, csrfToken, cookie);
      console.log(`Status: ${activateRes.status}`);
      if (activateRes.status !== 200) console.log('❌ Activate failed:', activateRes.data);
      else console.log('✅ User activated.');
    } else {
      console.log('⚠️ Skipping User specific tests (no user found).');
    }

    // 5. Create Category
    console.log('\\n[TEST 5] Creating Category...');
    const createCatRes = await request('POST', '/admin/categories', { 
      name: 'Test Category ' + Date.now(), 
      description: 'API Test' 
    }, token, csrfToken, cookie);
    console.log(`Status: ${createCatRes.status}`);
    let catId = null;
    if (createCatRes.status !== 201 && createCatRes.status !== 200) {
      console.log('❌ Category creation failed:', createCatRes.data);
    } else {
      console.log('✅ Category created successfully.');
      catId = createCatRes.data.data?.category?.id || createCatRes.data?.category?.id;
    }

    if (catId) {
      // 6. Get Category
      console.log(`\\n[TEST 6] Getting Category ${catId}...`);
      const getCatRes = await request('GET', `/admin/categories/${catId}`, null, token, csrfToken, cookie);
      console.log(`Status: ${getCatRes.status}`);
      if (getCatRes.status !== 200) console.log('❌ Get category failed:', getCatRes.data);
      else console.log('✅ Category retrieved successfully.');

      // 7. Delete Category
      console.log(`\\n[TEST 7] Deleting Category ${catId}...`);
      const delCatRes = await request('DELETE', `/admin/categories/${catId}`, null, token, csrfToken, cookie);
      console.log(`Status: ${delCatRes.status}`);
      if (delCatRes.status !== 200) console.log('❌ Delete category failed:', delCatRes.data);
      else console.log('✅ Category deleted successfully.');
    }

    // 8. Activity Logs
    console.log('\\n[TEST 8] Fetching Activity Logs...');
    const logsRes = await request('GET', '/admin/activity-logs', null, token, csrfToken, cookie);
    console.log(`Status: ${logsRes.status}`);
    if (logsRes.status !== 200) console.log('❌ Failed to fetch activity logs:', logsRes.data);
    else console.log('✅ Activity logs fetched successfully.');

    console.log('\\n🎉 All API tests executed!');

  } catch (err) {
    console.error('Test execution failed:', err.message);
  }
}

runTests();
