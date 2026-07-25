const fs = require('fs');
let code = fs.readFileSync('server/api/veritas.ts', 'utf8');

const historyEndpoint = `
router.get("/history", (req, res) => {
  res.json(globalStore.history.slice(0, 5));
});
`;

code = code.replace("export default router;", historyEndpoint + "\nexport default router;");
fs.writeFileSync('server/api/veritas.ts', code);
