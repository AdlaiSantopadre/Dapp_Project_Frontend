// contracts/scripts/copy-abi.js
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');
const dest = path.resolve(__dirname, '../../backend/abi/DocumentRegistry.json');

fs.copyFileSync(src, dest);
console.log('✅ ABI copiato nel backend!');
