const fs = require('fs');
const path = 'C:\\Users\\WERTSxINSIDE\\Desktop\\euphoria_launcher\\dist-electron\\main.js';

let content = fs.readFileSync(path, 'utf8');

// --- AUTH:REGISTER handler ---
// Find the full handler by counting braces from ipcMain.handle("auth:register"
function extractHandler(source, handlerName) {
  const prefix = `ipcMain.handle("${handlerName}"`;
  const idx = source.indexOf(prefix);
  if (idx === -1) return null;

  // Find the opening { of the async function body
  let braceStart = source.indexOf('{', idx + prefix.length);
  let depth = 0;
  let end = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        // Include the closing ) of ipcMain.handle() if present
        if (end < source.length && source[end] === ')') {
          end++;
        }
        break;
      }
    }
  }
  return { start: idx, end: end, text: source.substring(idx, end) };
}

// Extract old handlers
const oldRegister = extractHandler(content, 'auth:register');
const oldLogin = extractHandler(content, 'auth:login');
const oldSync = extractHandler(content, 'auth:sync');

console.log('Old register:', oldRegister.text.substring(0, 60), '...', oldRegister.text.substring(oldRegister.text.length - 30));
console.log('Old login:', oldLogin.text.substring(0, 60), '...', oldLogin.text.substring(oldLogin.text.length - 30));
console.log('Old sync:', oldSync.text.substring(0, 60), '...', oldSync.text.substring(oldSync.text.length - 30));

// New handlers
const newRegister = `ipcMain.handle("auth:register",async(e,a)=>{return{success:!1,error:"Register on our website"}})`;
const newLogin = `ipcMain.handle("auth:login",async(e,a)=>{try{const{username:t,password:i}=a;if(!t||!i)return{success:!1,error:"Fill all fields"};const r=await L.post("http://localhost:3000/api/launcher-auth",{username:t,password:i},{timeout:10000});return r.data}catch(t){return{success:!1,error:"Connection error: "+t.message)}})`;
const newSync = `ipcMain.handle("auth:sync",async(e,a)=>{try{if(!a)return{success:!1,error:"Username required"};const r=await L.post("http://localhost:3000/api/launcher-sync",{username:a},{timeout:10000});return r.data}catch(t){return{success:!1,error:"Connection error: "+t.message)}})`;

// Replace (order matters: replace from end to start to keep indices valid)
const replacements = [
  { old: oldSync, new: newSync },
  { old: oldLogin, new: newLogin },
  { old: oldRegister, new: newRegister },
];

// Sort by start position descending
replacements.sort((a, b) => b.old.start - a.old.start);

for (const r of replacements) {
  content = content.substring(0, r.old.start) + r.new + content.substring(r.old.end);
}

fs.writeFileSync(path, content, 'utf8');

// Verify
const check = fs.readFileSync(path, 'utf8');

console.log('\n=== VERIFICATION ===');
const regIdx = check.indexOf('ipcMain.handle("auth:register"');
const regSnippet = check.substring(regIdx, regIdx + 100);
console.log('Register:', regSnippet);

const loginIdx = check.indexOf('ipcMain.handle("auth:login"');
const loginSnippet = check.substring(loginIdx, loginIdx + 300);
console.log('Login:', loginSnippet);

const syncIdx = check.indexOf('ipcMain.handle("auth:sync"');
const syncSnippet = check.substring(syncIdx, syncIdx + 250);
console.log('Sync:', syncSnippet);

// Check no double ))
const doubleParen = check.indexOf('}}))');
console.log('\nDouble )) found:', doubleParen !== -1 ? 'YES at ' + doubleParen : 'NO - good');
