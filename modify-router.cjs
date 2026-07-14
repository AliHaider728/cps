const fs = require('fs');
const file = 'd:/hp Laptop Data/cps-intranet/cps-intranet/cps-intranet/frontend/src/routes/AppRouter.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('XeroCodesPage')) {
  content = content.replace(
    'const FinanceDashboard = lazy(() => import("../pages/finance/FinanceDashboard"));',
    'const FinanceDashboard = lazy(() => import("../pages/finance/FinanceDashboard"));\nconst XeroCodesPage = lazy(() => import("../pages/finance/XeroCodesPage"));'
  );
  content = content.replace(
    '<Route path="/dashboard/finance" element={<P roles={["finance", "super_admin", "director"]}><FinanceDashboard /></P>} />',
    '<Route path="/dashboard/finance" element={<P roles={["finance", "super_admin", "director"]}><FinanceDashboard /></P>} />\n          <Route path="/dashboard/xero" element={<P roles={["finance", "super_admin"]}><XeroCodesPage /></P>} />\n          <Route path="/dashboard/staff-xero" element={<P roles={["finance", "super_admin"]}><XeroCodesPage /></P>} />\n          <Route path="/dashboard/client-xero" element={<P roles={["finance", "super_admin"]}><XeroCodesPage /></P>} />'
  );
  fs.writeFileSync(file, content);
  console.log('Modified AppRouter.tsx');
} else {
  console.log('XeroCodesPage already included');
}
