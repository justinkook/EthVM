const indexes = {
  aggregate_block_metrics: [
    { key: { name: 1 } },
    { key: { date: -1 } },
    { key: { date: -1, name: 1 }, options: { unique: true } }
  ],

  balances: [
    { key: { address: 1 } },
    { key: { balanceType: 1 } }
  ],

  blocks: [
    { key: { "header.author": 1, _id: -1 } },
    { key: { "header.hash": 1 }, options: { unique: true } }
  ],

  block_metrics: [
    { key: { hash: 1 } }
  ],

  contracts: [
    { key: { type: 1 } },
    { key: { address: 1 } },
    { key: { creator: 1} },
    { key: { type: 1, address: 1 }, options: { unique: true } }
  ],

  token_transfers: [
    { key: { contract: 1, transferType: 1, from: 1, to: 1, timestamp: -1 } }
  ],

  token_exchange_rates: [
    { key: { address: 1 }, options: { unique: true } },
    { key: { market_cap_rank: 1 } },
    { key: { timestamp: 1 } }
  ],

  transactions: [
    { key: { hash: 1 } },
    { key: { blockHash: 1 } },
    { key: { from: 1, to: 1, timestamp: -1 } },
    { key: { blockNumber: -1, index: -1, timestamp: -1 } }
  ],

  uncles: [
    { key: { hash: 1 } },
    { key: { blockNumber: -1, number: -1 } }
  ]
};

function createIndexes(collectionId) {
  indexes[collectionId].forEach(params =>
    db[collectionId].createIndex(params.key, params.options)
  );
}

createIndexes("aggregate_block_metrics");
createIndexes("balances");
createIndexes("blocks");
createIndexes("blocks_metrics");
createIndexes("contracts");
createIndexes("token_transfers");
createIndexes("token_exchange_rates");
createIndexes("transactions");
createIndexes("uncles");
