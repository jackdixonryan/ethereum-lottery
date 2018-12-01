const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
require("events").EventEmitter.defaultMaxListeners = 0;

const { interface, bytecode } = require('../compile');

// initializes a new instance of web3 using the ganache provider to initiate a local web3 test environment. 
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let inbox;

beforeEach(async () => {
  // grab dummy accounts from ganache
  accounts = await web3.eth.getAccounts();

  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ 
      data: bytecode,
      arguments: ['Hello']
    })
    .send({
      from: accounts[0],
      gas: "1000000"
    });

  inbox.setProvider(provider);
});

describe('Inbox', () => {
  it('deploys a contract', () => {
    // makes sure that the contract has a value called address when it is created. 
    assert.ok(inbox.options.address);
  });

  it('has a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hello');
  });

  it('can change a message', async () => {
    await inbox.methods.setMessage("Mae Govannen").send({
      from: accounts[0]
    });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Mae Govannen');
  });
});