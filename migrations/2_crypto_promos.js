var CryptoPromos = artifacts.require("./CryptoPromos.sol");
module.exports = function(deployer) {
  deployer.deploy(CryptoPromos);
};