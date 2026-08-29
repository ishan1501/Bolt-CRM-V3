const http = require('http');

http.get('http://localhost:3000/api/proxy/api/users/leads/getLeadStagesWithSubStages?organizationId=12&managerType=lead&schoolId=27', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      console.log("Status:", res.statusCode);
      // We don't have the token so it might fail with 401, but the browser has it in localStorage!
      // Let's just look at the proxy logs instead.
    } catch (e) {
      console.error(e);
    }
  });
});
