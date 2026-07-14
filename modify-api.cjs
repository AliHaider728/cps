const fs = require('fs');
const file = 'd:/hp Laptop Data/cps-intranet/cps-intranet/cps-intranet/frontend/src/api/api.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('getAuditLog:')) {
  content = content.replace(
    'syncContact: (payload: { id: string; type: string; name: string; xeroCode?: string }) => \n    api.post("/xero/sync", payload).then((r) => r.data),',
    'syncContact: (payload: { id: string; type: string; name: string; xeroCode?: string }) => \n    api.post("/xero/sync", payload).then((r) => r.data),\n  getAuditLog: () => api.get("/xero/audit-log").then((r) => r.data),'
  );
  fs.writeFileSync(file, content);
  console.log('Modified api.ts');
}
