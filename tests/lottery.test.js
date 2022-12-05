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

    it('allow one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

        assert.equal(players.length, 1);
        assert.equal(players[0], accounts[0]);
    });

    it('allow multiple account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('1', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

        assert.equal(players.length, 3);
        assert.equal(players[0], accounts[0]);
        assert.equal(players[1], accounts[1]);
        assert.equal(players[2], accounts[2]);
    });
});