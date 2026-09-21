const fs = require('fs');
let content = fs.readFileSync('src/app/admin/upload/page.tsx', 'utf-8');

// 1. Change default expiry to '5 Days'
content = content.replace("const [expiry, setExpiry] = useState('Never');", "const [expiry, setExpiry] = useState('5 Days');");

// 2. Fix the array of options
content = content.replace(
  "{['3 Days', '1 Month', '1 Year', 'Never', 'Customized']",
  "{['5 Days', '1 Month', '1 Year', 'Never', 'Customized']"
);

// 3. Compute finalExpiryDate properly before sending
const computationLogic = `
      // Compute expiry date
      let finalExpiryDate = null;
      if (expiry === 'Customized' && customExpiryDate) {
        finalExpiryDate = customExpiryDate;
      } else if (expiry === '5 Days') {
        const d = new Date(); d.setDate(d.getDate() + 5);
        finalExpiryDate = d.toISOString();
      } else if (expiry === '1 Month') {
        const d = new Date(); d.setMonth(d.getMonth() + 1);
        finalExpiryDate = d.toISOString();
      } else if (expiry === '1 Year') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        finalExpiryDate = d.toISOString();
      }

      // Upload Pages individually for accurate progress`;

content = content.replace(
  "      // Upload Pages individually for accurate progress",
  computationLogic
);

// 4. Update the payload to send computed finalExpiryDate
content = content.replace(
  "customExpiryDate: expiry === 'Customized' ? customExpiryDate : null,",
  "customExpiryDate: finalExpiryDate,"
);

fs.writeFileSync('src/app/admin/upload/page.tsx', content);
