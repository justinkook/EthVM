const PublicTokens = artifacts.require("PublicTokens")
const TokenBalances = artifacts.require("TokenBalances")
const DummyToken = artifacts.require("DummyToken")
const DummyContract = artifacts.require("DummyContract")
const Web3 = require("web3")
const web3 = new Web3()
const bd = require("../libs/binaryDecoder.js")

function trim(str) {
  return str.replace(/\0[\s\S]*$/g, "")
}

let getHex = str => {
  return "0x" + Buffer.from(str, "utf8").toString("hex")
}

contract("PublicTokens", function(accounts) {
  let pt = null
  let tb = null
  let dt1 = null
  let dt2 = null
  let dt3 = null
  let dc = null

  before(async function() {
    pt = await PublicTokens.new()
    tb = await TokenBalances.new(pt.address)

    dt1 = await DummyToken.new(accounts[1], {
      from: accounts[1]
    })

    dt2 = await DummyToken.new(accounts[2], {
      from: accounts[2]
    })

    dt3 = await DummyToken.new(accounts[3], {
      from: accounts[3]
    })

    dc = await DummyContract.new()
  })

  it("should add token contracts", async function() {
    await pt.addSetToken(
      getHex("Dummy Token 1"),
      getHex("DT1"),
      dt1.address,
      5,
      getHex("http://www.dtoken1.eth"),
      getHex("support@dtoken1.eth"),
      {
        from: accounts[0]
      }
    )

    await pt.addSetToken(
      "Dummy Token 2",
      "DT2",
      dt2.address,
      6,
      "http://www.dtoken2.eth",
      "support@dtoken2.eth",
      {
        from: accounts[0]
      }
    )

    let tokenInfo1 = await pt.getToken(dt1.address)
    let tokenInfo2 = await pt.getToken(dt2.address)

    assert.equal(trim(web3.toAscii(tokenInfo1[0])), "Dummy Token 1")
    assert.equal(trim(web3.toAscii(tokenInfo1[1])), "DT1")
    assert.equal(tokenInfo1[2], dt1.address)
    assert.equal(tokenInfo1[3].toNumber(), 5)
    assert.equal(trim(web3.toAscii(tokenInfo1[4])), "http://www.dtoken1.eth")
    assert.equal(trim(web3.toAscii(tokenInfo1[5])), "support@dtoken1.eth")

    assert.equal(trim(web3.toAscii(tokenInfo2[0])), "Dummy Token 2")
    assert.equal(trim(web3.toAscii(tokenInfo2[1])), "DT2")
    assert.equal(tokenInfo2[2], dt2.address)
    assert.equal(tokenInfo2[3].toNumber(), 6)
    assert.equal(trim(web3.toAscii(tokenInfo2[4])), "http://www.dtoken2.eth")
    assert.equal(trim(web3.toAscii(tokenInfo2[5])), "support@dtoken2.eth")
  })

  it("should fail to register a token from other addresses", async function() {
    try {
      await pt.addSetToken(
        "Dummy Token 3",
        "DT3",
        dt3.address,
        7,
        "http://www.dtoken3.eth",
        "support@dtoken3.eth",
        {
          from: accounts[1]
        }
      )
      assert.fail("didnt fail the tx")
    } catch (e) {}
  })

  it("should have correct balances", async function() {
    let balance1 = await dt1.balanceOf(accounts[1])
    let balance2 = await dt2.balanceOf(accounts[2])

    assert.equal(balance1.toNumber(), 500000000000000)
    assert.equal(balance2.toNumber(), 500000000000000)
  })

  it("should get correct encoded string", async function() {
    let allBalance = await tb.getAllBalance(accounts[1], true, true, true, 0)
    let tokens = bd.decode(allBalance)

    assert.equal(tokens.length, 2)
    assert.equal(tokens[0].balance, 500000000000000)
    assert.equal(tokens[0].symbol, "DT1")
    assert.equal(tokens[1].balance, 0)
  })

  it("kill one contract and should still work", async function() {
    await dt2.killMe()

    let allBalance = await tb.getAllBalance(accounts[1], true, true, true, 0)
    let tokens = bd.decode(allBalance)

    assert.equal(tokens.length, 1)
    assert.equal(tokens[0].balance, 500000000000000)
    assert.equal(tokens[0].symbol, "DT1")
  })

  it("set random contract and should still work", async function() {
    await pt.addSetToken(
      "Dummy Contract",
      "DC",
      dc.address,
      6,
      "http://www.dcontract.eth",
      "support@dcontract.eth",
      {
        from: accounts[0]
      }
    )

    let allBalance = await tb.getAllBalance(accounts[1], true, true, true, 0)
    let tokens = bd.decode(allBalance)

    assert.equal(tokens.length, 2)
    assert.equal(tokens[0].balance, 500000000000000)
    assert.equal(tokens[0].symbol, "DT1")
    assert.equal(tokens[1].balance, 0)
    assert.equal(tokens[1].symbol, "DC")
  })
})
