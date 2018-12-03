import Web3 from 'web3';

let web3;

// If the browser window has Metamask, we set web3 equal to false so that the page doesn't just go haywire if the user doesn't have the browser extention. 
if (window.web3) web3 = new Web3(window.web3.currentProvider);

// if metamask is not detected, just call it false.
else web3 = false;

export default web3;