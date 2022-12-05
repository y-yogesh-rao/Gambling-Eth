const fs = require('fs');
const path = require('path');
const solCompiler = require('solc');

const lotteryContractPath = path.resolve(__dirname, 'contracts', 'lottery.sol');
const sourceCode = fs.readFileSync(lotteryContractPath, 'utf8');

let input = {
    language: 'Solidity',
    sources: {
        'lottery.sol': {
            content: sourceCode
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

let compiledData = JSON.parse(solCompiler.compile(JSON.stringify(input)));

module.exports = compiledData.contracts['lottery.sol'].Lottery;