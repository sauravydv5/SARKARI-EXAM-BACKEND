import { readFile } from 'fs/promises';

const loginRes = await fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@sarkariresult.local', password: 'admin123' }),
});
const loginData = await loginRes.json();
const token = loginData.token;
const fileBuffer = await readFile('tmp-test.pdf');
const formData = new FormData();
formData.append('pdf', new Blob([fileBuffer], { type: 'application/pdf' }), 'tmp-test.pdf');
const response = await fetch('http://localhost:5002/api/posts/import-pdf', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
console.log('status', response.status);
console.log(await response.text());
