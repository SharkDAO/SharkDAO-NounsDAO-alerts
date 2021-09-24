import dotenv from 'dotenv';
dotenv.config();

export const config = {
  JSON_RPC_URL: process.env.JSON_RPC_URL,
  DISCORD_KEY: process.env.DISCORD_KEY,
  ETHERSCAN_KEY: process.env.ETHERSCAN_KEY,
  contract_address: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
  discord_channel: '889377541675159605'
};

import axios from 'axios';
const abi_url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${config.contract_address}&apikey=${config.ETHERSCAN_KEY}`;
var contract = '';

export async function getContract() {
  const abi = await axios.get(abi_url).then((result) => {return (JSON.parse(result.data.result))});
  contract = new web3.eth.Contract(abi, config.contract_address);
}

import Web3 from 'web3';
const web3 = new Web3(config.JSON_RPC_URL);
import sharp from 'sharp';

export async function getImage(tokenId) {
  const dataURI = await contract.methods.dataURI(tokenId).call();

  const data = JSON.parse(
    Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
  );
  const svg = Buffer.from(data.image.substring(26), 'base64');
  return sharp(svg).png().toBuffer();
}

export async function getSupply() {
  return contract.methods.totalSupply().call();
}