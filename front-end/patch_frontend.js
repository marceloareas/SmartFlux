const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf8');
pageContent = pageContent.replace(
  'const users = await usersRes.json();\n        if (users.length > 0) setCurrentUser(users[0]);',
  'const user = await usersRes.json();\n        if (user && user.id) setCurrentUser(user);'
);
fs.writeFileSync('app/page.tsx', pageContent);

let profileContent = fs.readFileSync('app/profile/page.tsx', 'utf8');
profileContent = profileContent.replace(
  "const usersRes = await fetchApi('/api/users');",
  "const usersRes = await fetchApi('/api/users/me');"
).replace(
  'const users = await usersRes.json();\n        if (users.length > 0) {\n          const u = users[0];',
  'const u = await usersRes.json();\n        if (u && u.id) {'
);
fs.writeFileSync('app/profile/page.tsx', profileContent);

