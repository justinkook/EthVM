var BN = require('bignumber.js')
var utils = require('web3-utils')

module.exports = hex => {
  const tokens = []

  const sizeHex = bytes => bytes * 2
  const trim = str => str.replace(/\0[\s\S]*$/g, "")

  const getAscii = h => {
    h = h.substring(0, 2) === "0x" ? h : "0x" + h
    return trim(utils.toAscii(h))
  }

  hex = hex.substring(0, 2) === "0x" ? hex.substring(2) : hex
  hex = hex.substring(0, hex.lastIndexOf("1") - 1) // starting point

  let offset = hex.length
  offset -= sizeHex(32)

  const countTokens = hex.substr(offset, sizeHex(32))
  offset -= sizeHex(1)

  const isName = parseInt(hex.substr(offset, sizeHex(1)))
  offset -= sizeHex(1)

  const isWebSite = parseInt(hex.substr(offset, sizeHex(1)))
  offset -= sizeHex(1)

  const isEmail = parseInt(hex.substr(offset, sizeHex(1)))
  const numTokens = new BN("0x" + countTokens).toNumber()

  for (let i = 0; i < numTokens; i++) {
    const token = {}

    offset -= sizeHex(16)

    token.symbol = getAscii(hex.substr(offset, sizeHex(16)))
    offset -= sizeHex(20)

    token.addr = "0x" + hex.substr(offset, sizeHex(20))
    offset -= sizeHex(1)

    token.decimals = new BN("0x" + hex.substr(offset, sizeHex(1))).toNumber()
    offset -= sizeHex(32)

    token.balance = new BN("0x" + hex.substr(offset, sizeHex(32))).toFixed()

    if (isName) {
      offset -= sizeHex(16)
      token.name = getAscii(hex.substr(offset, sizeHex(16)))
    }

    if (isWebSite) {
      offset -= sizeHex(32)
      token.website = getAscii(hex.substr(offset, sizeHex(32)))
    }

    if (isEmail) {
      offset -= sizeHex(32)
      token.email = getAscii(hex.substr(offset, sizeHex(32)))
    }

    tokens.push(token)
  }

  return tokens
}
