const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
code = code.replace(
  "import { motion, AnimatePresence } from 'motion/react';",
  "import { motion, AnimatePresence } from 'motion/react';\nimport { AdminDashboard } from './components/AdminDashboard';\nimport { PartnerDashboard } from './components/PartnerDashboard';\nimport { IngestionForm } from './components/IngestionForm';"
);

// Remove Comptes de demonstration from LoginView
code = code.replace(
  /<div className="mt-8 pt-6 border-t border-slate-100">[\s\S]*?<\/div>\s*<\/div>/,
  "</div>"
);

// We need to remove the inline AdminDashboard, PartnerDashboard, IngestionForm
const ingestionFormStart = code.indexOf('const IngestionForm = () => {');
const mainViewStart = code.indexOf('const MainView = () => {');
if (ingestionFormStart !== -1 && mainViewStart !== -1) {
  code = code.substring(0, ingestionFormStart) + code.substring(mainViewStart);
}

fs.writeFileSync('src/App.tsx', code);
