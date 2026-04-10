const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  'const accRes = await fetchApi(\'/api/accounts\');\n        const accs = await accRes.json();\n        if (accs.length > 0) setAccount(accs[0]);',
  "const accRes = await fetchApi('/api/accounts');\n        const accs = await accRes.json();\n        const myAcc = accs.find((a: any) => a.user?.id === user.id);\n        if (myAcc) setAccount(myAcc);"
);

code = code.replace(
  "const fetchCategories = async () => {",
  "const fetchCategories = async (uid: string) => {"
).replace(
  "setCategories(data.map((c: any) => ({",
  "setCategories(data.filter((c: any) => c.user?.id === uid).map((c: any) => ({"
);

code = code.replace(
  "const fetchTransactions = async () => {",
  "const fetchTransactions = async (accId: string) => {"
).replace(
  "data.sort((a: any, b: any)",
  "const myTxs = data.filter((t: any) => t.account?.id === accId);\n      myTxs.sort((a: any, b: any)"
).replace(
  "data.forEach((t: any) => {",
  "myTxs.forEach((t: any) => {"
);

code = code.replace(
  "await fetchCategories();\n        await fetchTransactions();",
  "await fetchCategories(user.id);\n        if (myAcc) await fetchTransactions(myAcc.id);"
);

code = code.replace(
  "fetchTransactions();",
  "if (account) fetchTransactions(account.id);"
).replace(
  "fetchTransactions();",
  "if (account) fetchTransactions(account.id);"
);

fs.writeFileSync('app/page.tsx', code);
