const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const web3 = require('web3');
const fs = require('fs');
let jsonData = require('./mercleTreeData.json');

async function main() {
  const nodes = jsonData["nodes"];
  let elems = [];
  nodes.forEach(element => {
    let hash = web3.utils.soliditySha3(element.address, element.category, element.amount);
    elems.push(hash);
  });

  const merkleTree = new MerkleTree(elems, keccak256, { hashLeaves: false, sortPairs: true });

  const root = merkleTree.getHexRoot();

  console.log("Root hash:", root);

  let proofs = [];
  for (let i = 0; i < nodes.length; i++) {
    let proof = merkleTree.getHexProof(elems[i]);
    proofs.push(proof);
    jsonData["nodes"][i]["proof"] = proof;
  }

  fs.writeFileSync(`./mercleTreeDataWithProofs.json`, JSON.stringify(jsonData));

  // console.log("Proofs for the contract:", proofs);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });