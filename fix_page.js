const fs = require('fs');
let content = fs.readFileSync('front-end/app/page.tsx', 'utf8');
content = content.replace(
  '  useEffect(() => {\n    const loadData = async () => {\n      try {',
  `  useEffect(() => {
    if (typeof window !== 'undefined' && (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken'))) {
      window.location.href = '/login';
      return;
    }
    const loadData = async () => {
      try {`
);
fs.writeFileSync('front-end/app/page.tsx', content);
