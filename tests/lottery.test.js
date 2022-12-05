const assert = require('assert');
const ganache = require('ganache');
const compiledFile = require('../compile');

const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    const abi = compiledFile.abi;
    const bytecode = compiledFile.evm.bytecode.object;

    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 1000000 })
});

describe('Lottery', () => {
    it('contract deployed', () => {
        assert.ok(lottery.options.address);
    });
});