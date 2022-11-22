//Library Imports
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const Web3WsProvider = require("web3-providers-ws");
const path = require("path");
const scriptName = path.basename(__filename).replace(".js", "");

// Global variables
const { TOKEN, SERVER_URL, TOKEN_ADDRESS, NFT_ADDRESS, BUILD, WS_API_KEY, PORT } = process.env;

// Function Imports
const { addToGroups, checkIfAdded } = require("./utils/groupsHandlers");
const { nftEvents } = require("./utils/events/nftEvents");
const { tokenEvents } = require("./utils/events/tokenEvents");
const { sendMessage, sendPhoto } = require("./utils/sendResponse");
const { getNFTData } = require("./utils/getNFTData");
//Express
const app = express();
app.use(bodyParser.json());

//Webhook
let serverUrl = SERVER_URL;
if (BUILD == "Test") {
  serverUrl = "https://d8ee-2601-589-4d7e-5290-dcd2-83a8-5643-224c.ngrok.io";
}
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/app2/${TOKEN}`;
const WEBHOOK_URL = serverUrl + URI;

// Websocket
const wsOptions = {
  timeout: 30000, // ms

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000, // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};
const ws = new Web3WsProvider(WS_API_KEY, wsOptions);

// Web3 declarations
let nftAbi = fs.readFileSync("./blockchain/nftAbi.json");
nftAbi = JSON.parse(nftAbi);
let tokenAbi = fs.readFileSync("./blockchain/tokenAbi.json");
tokenAbi = JSON.parse(tokenAbi);
let routerAbi = fs.readFileSync("./blockchain/routerAbi.json");
routerAbi = JSON.parse(routerAbi);
const web3 = new Web3(ws);
const nftAddress = NFT_ADDRESS.toLowerCase();
const nftContract = new web3.eth.Contract(nftAbi, nftAddress);
const tokenAddress = TOKEN_ADDRESS.toLowerCase();
const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);

const init = async () => {
  try {
    let nftsLeft = await nftContract.methods.lastSupply().call();
    let totalTokenSupply = parseInt(await tokenContract.methods.totalSupply().call());
    const decimals = parseInt(await tokenContract.methods.decimals().call());

    // Listen for nft contract events
    nftEvents(nftContract, nftAddress, nftsLeft, TELEGRAM_API);

    // // Listen for token contract events
    tokenEvents(web3, tokenContract, totalTokenSupply, decimals, TELEGRAM_API);
  } catch (err) {
    console.log(err);
  }
};

app.post(URI, (req, res) => {
  try {
    if (req.body.message.chat) {
      const chatId = req.body.message.chat.id;
      const command = req.body.message.text;
      const messageId = req.body.message.message_id;
      if (command === "/startbot") {
        if (checkIfAdded(chatId) === false) {
          const addToGroup = addToGroups(chatId);
          if (addToGroup) {
            sendMessage(TELEGRAM_API, chatId, `*NFT Bot activated with chat id:* ${chatId}`, messageId);
          } else {
            sendMessage(TELEGRAM_API, chatId, `*Error starting bot with chat id:* ${chatId}`, messageId);
          }
        } else {
          sendMessage(TELEGRAM_API, chatId, `*NFT Bot already active*`, messageId);
        }
      } else if (command.split(" ")[0] == "/nftlookup") {
        if (checkIfAdded(chatId) == true) {
          const nftID = parseInt(command.split(" ")[1]);
          if (nftID) {
            try {
              getNFTData(nftContract, nftID).then((data) => {
                sendPhoto(TELEGRAM_API, chatId, data.imageURI, `*Owner:* https://bscscan.com/address/${data.owner}\n\n${data.traitValue}`, ["View On TofuNFt", `https://tofunft.com/nft/bsc/${nftAddress}/${nftID}`], messageId);
              });
            } catch (err) {
              console.log(err);
              sendMessage(TELEGRAM_API, chatId, "Please try again later", messageId);
            }
          } else {
            sendMessage(TELEGRAM_API, chatId, `*This command looks up the image of a given Firefox NFT. Please include the id of the nft following the command.* \nExample: /nftlookup 420`, messageId);
          }
        } else {
          console.log("Group not added");
        }
      }
    }
    return res.send();
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT || 5000, () => {
  console.log("🚀 app running on port", PORT || 5000);

  // Delete and unsubscribe to webhook events
  axios.get(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`).then((res) => {
    console.log(res.data);
    // Subscribe to webhook events
    axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`).then((res) => {
      console.log(res.data);
      init();
    });
  });
  axios.get(`${TELEGRAM_API}/getMyCommands`).then((res) => {
    console.log(res.data);
  });
});
