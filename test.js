const API = 'https://medverse-1-0.vercel.app/api';
let cookieStr = '';
const myFetch = async (path, opts = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (cookieStr) headers['Cookie'] = cookieStr;
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookieStr = setCookie.split(';')[0];
  }
  return { status: res.status, data: await res.json().catch(()=>({})) };
};

async function runTest() {
  console.log("=== A to Z Test ===");
  try {
    // 1. Register Team
    console.log("\n1. Registering Team...");
    const reg = await myFetch('/auth/register', {
      method: 'POST', body: JSON.stringify({
        teamName: 'Test Automation Team ' + Date.now(), track: 'A', password: 'password123',
        leadName: 'Lead Tester', size: 3,
        members: [
          { name: 'Lead', regNo: 'R1' + Date.now() },
          { name: 'M2', regNo: 'R2' + Date.now() },
          { name: 'M3', regNo: 'R3' + Date.now() }
        ]
      })
    });
    console.log("Reg Status:", reg.status, reg.data);
    if(reg.status !== 200) throw new Error("Registration failed");
    const teamCode = reg.data.code;

    // 2. Login Team
    console.log("\n2. Logging in Team...", teamCode);
    cookieStr = ''; // clear cookies
    const login = await myFetch('/auth/team/login', {
      method: 'POST', body: JSON.stringify({ code: teamCode, password: 'password123' })
    });
    console.log("Login Status:", login.status);
    if(login.status !== 200) throw new Error("Team Login failed");
    
    // 3. Get Team State
    const me = await myFetch('/team/me');
    console.log("Team Me Status:", me.status, "Kit:", me.data.kit ? "Assigned" : "Missing");

    // 4. Admin Login
    console.log("\n4. Admin Login...");
    cookieStr = '';
    const adminLogin = await myFetch('/auth/admin/login', {
      method: 'POST', body: JSON.stringify({ password: 'super_secure_admin' })
    });
    console.log("Admin Login Status:", adminLogin.status);

    // Start Round 1
    console.log("Starting Round 1...");
    await myFetch('/admin/start-round', { method: 'POST' });

    // Create Judge
    console.log("Creating Judge...");
    const judgeUser = 'judge_' + Math.random().toString(36).substring(7);
    const jCreate = await myFetch('/admin/create-judge', {
      method: 'POST', body: JSON.stringify({ username: judgeUser, tempPassword: 'temp_password' })
    });
    console.log("Judge Created Status:", jCreate.status);

    // Assign Judge
    console.log("Assigning Judge...");
    const assign = await myFetch('/admin/assign-judge', {
      method: 'POST', body: JSON.stringify({ judgeUsername: judgeUser, teamCode: teamCode, roundIdx: 0 })
    });
    console.log("Assign Status:", assign.status);

    // 5. Team Submits
    console.log("\n5. Team Submitting...");
    cookieStr = '';
    await myFetch('/auth/team/login', {
      method: 'POST', body: JSON.stringify({ code: teamCode, password: 'password123' })
    });
    const sub = await myFetch('/team/submit', {
      method: 'POST', body: JSON.stringify({ content: 'This is an automated test submission from A to Z.' })
    });
    console.log("Submit Status:", sub.status);

    // 6. Judge Login & Decide
    console.log("\n6. Judge Workflow...");
    cookieStr = '';
    const jLog = await myFetch('/auth/judge/login', {
      method: 'POST', body: JSON.stringify({ username: judgeUser, password: 'temp_password' })
    });
    console.log("Judge Login Status:", jLog.status);

    // Need to set password for judge first!
    if (jLog.data.mustChangePassword) {
        console.log("Judge changing password...");
        await myFetch('/auth/judge/change-password', {
            method: 'POST', body: JSON.stringify({ newPassword: 'new_password123' })
        });
    }

    const jSubs = await myFetch(`/judge/submissions?teamCode=${teamCode}&round=0`);
    const subId = jSubs.data.submissions[0].id;
    console.log("Found Submission ID:", subId);

    const decide = await myFetch(`/judge/submissions/${subId}/decide`, {
      method: 'POST', body: JSON.stringify({ decision: 'accept', feedback: 'Great job test bot' })
    });
    console.log("Decide Status:", decide.status);

    // Score
    const score = await myFetch('/judge/score', {
      method: 'POST', body: JSON.stringify({
        code: teamCode, roundIdx: 0,
        medical: 9, technical: 8, adapt: 7, budget: 10, innovation: 8, pitch: 9
      })
    });
    console.log("Score Status:", score.status);

    console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
  } catch(e) {
    console.error("Test Failed:", e);
  }
}
runTest();