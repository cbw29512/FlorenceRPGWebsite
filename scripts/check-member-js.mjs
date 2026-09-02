import { execFileSync } from 'node:child_process';

const files=['assets/js/member-auth.js','assets/js/member-api.js','assets/js/member-render.js','assets/js/member-console.js'];
let failed=false;
for(const file of files){
  try{execFileSync(process.execPath,['--check',file],{stdio:'inherit'});console.log(`Syntax OK: ${file}`);}
  catch(error){console.error(`Syntax check failed: ${file}`,error);failed=true;}
}
if(failed) process.exit(1);
