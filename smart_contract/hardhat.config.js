
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/SbSLDNFdDuIeDVL4SxY4Hs-PY7UDJdXp',
      accounts: ['4f33e20c5675d0f2b183a1bf0695dcac1073736200f9c6050388c118b2fac9c2']
    }
  }
}