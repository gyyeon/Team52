var Company = artifacts.require("./Company.sol");

module.exports = function(deployer) {
  deployer.deploy(Company);
};
