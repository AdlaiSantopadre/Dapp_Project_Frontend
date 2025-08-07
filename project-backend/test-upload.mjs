import fs from 'fs';
import { uploadToIPFS } from './services/ipfs.js';

const buffer = fs.readFileSync('./test.pdf'); // Sostituisci con un file reale
const cid = await uploadToIPFS(buffer, 'test.pdf');

console.log('✅ File caricato su IPFS con CID:', cid);
