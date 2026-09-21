const fs = require('fs');
let content = fs.readFileSync('src/app/auth/login/page.tsx', 'utf-8');

// Remove agreed state
content = content.replace("  const [agreed, setAgreed] = useState(false);\n", "");

// Remove checkbox block
const checkboxRegex = /<div className="flex items-start gap-3 mt-4">[\s\S]*?<\/div>/;
content = content.replace(checkboxRegex, "");

// Fix button disabled state
content = content.replace("disabled={loading || !agreed}", "disabled={loading}");
content = content.replace("disabled:opacity-50", "disabled:opacity-70");

// Fix google button
content = content.replace(
  `            onClick={(e) => {
              if (!agreed) {
                e.preventDefault();
                setError('Please agree to the Terms of Service and Privacy Policy before continuing.');
              }
            }}
`, 
  ""
);

content = content.replace(
  "className={`w-full h-12 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 shadow-sm ${\n              !agreed ? 'opacity-50 cursor-not-allowed hover:bg-white' : 'hover:bg-slate-50'\n            }`}",
  "className=\"w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 shadow-sm\""
);

fs.writeFileSync('src/app/auth/login/page.tsx', content);
