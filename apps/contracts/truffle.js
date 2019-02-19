module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gasPrice: "0x4A817C800"
    },
    live: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gasPrice: "0x3b9aca00"
    },
    ropsten: {
      host: "https://api.myetherapi.com/rop",
      port: 443,
      network_id: "*",
      gasPrice: "0x3b9aca00"
    }
  },
  compilers: {
    solc: {
      version: '0.5.4',
      docker: true
    }
  }
};
