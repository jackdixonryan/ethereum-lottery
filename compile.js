const path = require('path');
const fs = require('fs');
const solc = require("solc");

// First we use path to find our way to the solidity contract.
const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');

// Then we use fs to read the file...
const src = fs.readFileSync(inboxPath, 'utf8');

// Essentially tells js to compile 1 contract from the source file, which we read sync above.
// console.log(solc.compile(src, 1));


// Now we export just the Inbox item of the resulting code. 
module.exports = solc.compile(src, 1).contracts[':Inbox'];