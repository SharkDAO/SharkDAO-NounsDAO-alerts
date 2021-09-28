import Web3 from 'web3';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  JSON_RPC_URL: process.env.JSON_RPC_URL,
  DISCORD_KEY: process.env.DISCORD_KEY,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  ETHERSCAN_KEY: process.env.ETHERSCAN_KEY,
  contract_address: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
};

const abi_url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${config.contract_address}&apikey=${config.ETHERSCAN_KEY}`;
const web3 = new Web3(config.JSON_RPC_URL);
var contract = '';

const path_to_layers = './encoded-layers.json';
const layers = JSON.parse(fs.readFileSync(path_to_layers, 'utf-8'));
const background = ['cool', 'warm'];
const bodies_obj = layers.parts[0];
const accessories_obj = layers.parts[1];
const heads_obj = layers.parts[2];
const glasses_obj = layers.parts[3]

const bodies_modifier = 'body-';
const accessories_modifer = 'accessory-';
const heads_modifier = 'head-';
const glass_modifier = 'glasses-';

function getLayerArray(obj, modifier) {
  var a = [];
  obj.forEach(o => {
    a.push(o.name.split(modifier)[1]);
  });
  return a;
}

const bodies = getLayerArray(bodies_obj, bodies_modifier);
const accessories = getLayerArray(accessories_obj, accessories_modifer);
const heads = getLayerArray(heads_obj, heads_modifier);
const glasses = getLayerArray(glasses_obj, glass_modifier);

export async function getNounDescription(tokenId){
  const seeds = await contract.methods.seeds(tokenId).call()
  return({'background': background[seeds.background],'body':bodies[seeds.body], 'accessory':accessories[seeds.accessory], 'head':heads[seeds.head], 'glasses':glasses[seeds.glasses]});
}

export async function getContract() {
  const abi = await axios.get(abi_url).then((result) => {return (JSON.parse(result.data.result))});
  contract = new web3.eth.Contract(abi, config.contract_address);
}

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

export async function getSeeds(tokenId) {
  return contract.methods.seeds(tokenId).call();
}