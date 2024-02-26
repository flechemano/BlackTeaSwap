// Import necessary modules
const express = require('express');
const path = require('path');
const Web3 = require('web3');
const contract = require('@truffle/contract');

// Initialize Express app
const app = express();

// Set up middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Initialize Web3 and connect to the Ethereum network
const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(web3Provider);

// Load your smart contract ABI and address
const contractAbi = require('./build/contracts/YourContract.json').abi;
const contractAddress = '0xYourContractAddress'; // Replace with your contract address

// Create a contract object
const yourContract = contract({
  abi: contractAbi
});
yourContract.setProvider(web3Provider);
const contractInstance = yourContract.at(contractAddress);

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/getData', async (req, res) => {
  try {
    const data = await contractInstance.getData();
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

