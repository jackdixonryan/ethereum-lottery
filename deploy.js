const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

// setting up our truffle wallet with my BRAVE (not chrome) browser's mnemonic. 
const provider = new HDWalletProvider(
  "soap garden film super inhale stamp skirt image zoo prepare clay river",
  "https://rinkeby.infura.io/v3/2f3766d23447480e8b47863bdb493a49"
);

const web3 = new Web3(provider);

// calling this function is solely for the purpose of using async/await.
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: ['Mae Govannen.']
    })
    .send({
      gas: '1000000',
      from: accounts[0]
    });
  
  console.log("contract deployed to", result.options.address);
};

deploy();
