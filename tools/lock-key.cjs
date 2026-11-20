// Encrypts your Groq key with a password and writes ../vault.json.
// Only the encrypted form is published; the app asks for the password once on your phone.
// Usage: node tools/lock-key.cjs [path-to-.env]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = process.argv[2] || 'D:/DataAnalystAgent/.env';
const match = fs.readFileSync(envPath, 'utf8').match(/^\s*GROQ[A-Z_]*KEY\s*=\s*["']?([^"'\r\n#]+)/m);
if (!match) { console.error('No GROQ ..._KEY line found in ' + envPath); process.exit(1); }
const apiKey = match[1].trim();

function askHidden(question) {
  return new Promise(resolve => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    let s = '';
    const onData = chunk => {
      for (const c of chunk) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', onData);
          process.stdout.write('\n'); return resolve(s);
        }
        if (c === '\u0003') process.exit(1);
        if (c === '\u007f' || c === '\b') { if (s) { s = s.slice(0, -1); process.stdout.write('\b \b'); } continue; }
        s += c; process.stdout.write('*');
      }
    };
    stdin.on('data', onData);
  });
}

(async () => {
  console.log('Locking the Groq key from ' + envPath);
  const pw = await askHidden('Choose a password for the translator (at least 10 characters): ');
  if (pw.length < 10) { console.error('Too short — run it again.'); process.exit(1); }
  if (await askHidden('Type it again: ') !== pw) { console.error('They do not match — run it again.'); process.exit(1); }

  const iter = 600000, salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(pw, salt, iter, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  const out = path.join(__dirname, '..', 'vault.json');
  fs.writeFileSync(out, JSON.stringify({ v: 1, iter, salt: salt.toString('base64'), iv: iv.toString('base64'), data: data.toString('base64') }, null, 1) + '\n');
  console.log('Done. Encrypted key saved to ' + out + '. Tell Claude it is done; you can close this tab.');
})();
