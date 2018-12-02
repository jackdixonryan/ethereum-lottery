import Web3 from 'web3';

let web3;

if (window.web3) web3 = new Web3(window.web3.currentProvider);
else web3 = false;

export default web3;