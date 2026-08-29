async function test() {
  const req = await fetch('http://127.0.0.1:3000/api/proxy/api/v2/org/manage-leads/fetchAllLeads?page=1&limit=5&schoolId=82c13b45-7569-4ce7-8ab8-411546ea5580', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const data = await req.json();
  console.log(JSON.stringify(data.data[0], null, 2));
}

test();
