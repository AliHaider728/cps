const fs = require('fs');
const file = 'd:/hp Laptop Data/cps-intranet/cps-intranet/cps-intranet/frontend/src/lib/repositories.ts';
let content = fs.readFileSync(file, 'utf8');

const apiAdditions = `

export const xeroApi = {
  getStatus: () => api.get("/xero/status").then((r) => r.data),
  connectUrl: () => api.get("/xero/connect").then((r) => r.data.url),
  disconnect: () => api.post("/xero/disconnect").then((r) => r.data),
  getContacts: () => api.get("/xero/contacts").then((r) => r.data),
  getSyncStatus: () => api.get("/xero/sync-status").then((r) => r.data),
  syncContact: (payload: { id: string; type: string; name: string; xeroCode?: string }) => 
    api.post("/xero/sync", payload).then((r) => r.data),
};
`;

if (!content.includes('xeroApi')) {
  content += apiAdditions;
  fs.writeFileSync(file, content);
  console.log('Modified repositories.ts');
} else {
  console.log('xeroApi already included');
}
