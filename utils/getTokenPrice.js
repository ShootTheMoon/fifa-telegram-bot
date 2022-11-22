const fs = require("fs");
require("dotenv").config();

const { TOKEN_ADDRESS, ROUTER_ADDRESS, USD_ADDRESS } = process.env;
let tokenAbi = fs.readFileSync("./blockchain/tokenAbi.json");
tokenAbi = JSON.parse(tokenAbi);
let routerAbi = fs.readFileSync("./blockchain/routerAbi.json");
routerAbi = JSON.parse(routerAbi);

const tokenAddress = TOKEN_ADDRESS.toLowerCase();
const usdAddress = USD_ADDRESS.toLowerCase();
const routerAddress = ROUTER_ADDRESS.toLowerCase();
const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //BNB

async function calcSell(tokensToSell, web3) {
  const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //BNB

  let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddress);
  let tokenDecimals = await tokenRouter.methods.decimals().call();

  tokensToSell = setDecimals(tokensToSell, tokenDecimals);
  let amountOut;
  try {
    let router = await new web3.eth.Contract(routerAbi, routerAddress);
    amountOut = await router.methods.getAmountsOut(tokensToSell, [tokenAddress, BNBTokenAddress]).call();
    amountOut = web3.utils.fromWei(amountOut[1]);
  } catch (error) {}

  if (!amountOut) return 0;
  return amountOut;
}
async function calcBNBPrice(web3) {
  let bnbToSell = web3.utils.toWei("1", "ether");
  let amountOut;
  try {
    let router = await new web3.eth.Contract(routerAbi, routerAddress);
    amountOut = await router.methods.getAmountsOut(bnbToSell, [BNBTokenAddress, usdAddress]).call();
    amountOut = web3.utils.fromWei(amountOut[1]);
  } catch (error) {}
  if (!amountOut) return 0;
  return amountOut;
}
function setDecimals(number, decimals) {
  number = number.toString();
  let numberAbs = number.split(".")[0];
  let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
  while (numberDecimals.length < decimals) {
    numberDecimals += "0";
  }
  return numberAbs + numberDecimals;
}
/*
How it works?
This script simply comunicates with the smart contract deployed by pancakeswap and calls the main
function that was build to retrive the token prices
*/
const getTokenPrice = async (web3) => {
  let bnbPrice = await calcBNBPrice(web3); // query pancakeswap to get the price of BNB in USDT
  // Them amount of tokens to sell. adjust this value based on you need, you can encounter errors with high supply tokens when this value is 1.
  let tokens_to_sell = 1;
  let priceInBnb = (await calcSell(tokens_to_sell, web3)) / tokens_to_sell;
  return priceInBnb * bnbPrice;
};

module.exports = { getTokenPrice };
