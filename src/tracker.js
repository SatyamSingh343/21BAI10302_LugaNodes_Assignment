// Importing required modules
const { Alchemy, Network } = require('alchemy-sdk');
const { ethers } = require('ethers');
const { Interface } = require('@ethersproject/abi');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const axios = require('axios');
const depositFilePath = path.join(__dirname, '../data/deposits.json');
require('dotenv').config();


const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
// Stay updated by joining my Telegram channel: https://t.me/luganordes21BAI10302 
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
// Alchemy settings ( Which I will use for websocket connection)
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // this represents my  Alchemy API Key which i used 
  network: Network.ETH_MAINNET, // We are connecting to the Ethereum mainnet
  maxRetries: 10,// The number of retries in case of a connection failure
};

// Here  I have initialized  Alchemy with websocket support using the provided settings
const alchemy = new Alchemy(settings);




// Address of the Ethereum Beacon Chain Deposit Contract
const beaconContractAddress = '0x00000000219ab540356cBB839Cbe05303d7705Fa';



// ABI to define the structure of the DepositEvent
const eventABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "withdrawal_credentials", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "amount", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "signature", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "index", "type": "bytes" }], "name": "DepositEvent", "type": "event" }, { "inputs": [{ "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "internalType": "bytes", "name": "withdrawal_credentials", "type": "bytes" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }, { "internalType": "bytes32", "name": "deposit_data_root", "type": "bytes32" }], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "get_deposit_count", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "get_deposit_root", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }];



// Set up the contract interface for decoding event logs
const contractInterface = new Interface(eventABI);
//Below i have defined a function to convert little-endian hex to a big integer.
const convertLittleEndianToBigInt = (hexString) => {
  const bytes = ethers.utils.arrayify(hexString);
  let result = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    result += BigInt(bytes[i]) << BigInt(8 * i);
  }
  return result;
};


// Function to send notifications via Telegram
const sendTelegramNotification = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message
    });
    logger.info('Telegram notification sent successfully .');
  } catch (error) {
    logger.error('Failure to send Telegram notification:', error);
  }
};

// Function to handle incoming deposit events in real-time
const processDepositEvent = async (log) => {
  try {
        // Decode the event log data

    const decodedLog = contractInterface.parseLog(log);
    const { pubkey, amount } = decodedLog.args;
   


    // Get block details, which include the block timestamp
    const block = await alchemy.core.getBlock(log.blockNumber);



    // this is used to get the transaction receipt to calculate fee
    const receipt = await alchemy.core.getTransactionReceipt(log.transactionHash);
    const fee = receipt.gasUsed.mul(receipt.effectiveGasPrice).toString();


// Constructing  the deposit object according to the schema given in the task provided ->
    const deposit = {
      blockNumber: log.blockNumber,
      blockTimestamp: block.timestamp,
      
      fee, // Fee is in wei
      hash: log.transactionHash,
      pubkey: ethers.hexlify(pubkey),

    };

    logger.info('New Deposit Event:', deposit);

    // Append the deposit information to the file to maintain persistence
    fs.appendFileSync(depositFilePath, JSON.stringify(deposit, null, 2));

   // Notify via Telegram with relevant transaction details

    const message = `Fee: ${fee} Wei\nTransaction Hash: ${log.transactionHash} `;
    await sendTelegramNotification(message);
  } catch (error) {
    logger.error('Error while processing deposit event:', error);
  }
};



// Function to subscribe to deposit events via Alchemy's WebSocket
const subscribeToDepositEvents = () => {
  try {
     // Subscribe to the DepositEvent using WebSocket, listening for logs matching the event signature
    alchemy.ws.on({
      address: beaconContractAddress,
      topics: [
        ethers.id("DepositEvent(bytes,bytes,bytes,bytes,bytes)") // Topic for DepositEvent
      ]
    }, (log) => {
      logger.info("Received log:", log);
      
      if (Array.isArray(log)) {
        // If log is an array, we will handle  each log separately
        for (const singleLog of log) {
          processDepositEvent(singleLog);
        }
      } else {
      
        processDepositEvent(log);
      }

    });



    logger.info('Subscribed to real-time deposit events successfully.');
  } catch (error) {
    logger.error('Error while subscribing to deposit events:', error);
  }
};



// Send a startup notification and begin listening for events
//To see Live updates join Telegram group https://t.me/luganordes21BAI10302
sendTelegramNotification("The Tracker is live and it is  running");
subscribeToDepositEvents();
