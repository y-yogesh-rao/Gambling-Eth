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

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 10
            });
            assert(false);
        } catch(error) {
            assert(error);
        }
    });

    it('only managers can pick the winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
                value: web3.utils.toWei('3', 'ether')
            });
            assert(false);
        } catch(error) {
            assert(error);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        assert((finalBalance - initialBalance) > web3.utils.toWei('1.8', 'ether'));

        const players = await lottery.methods.getPlayers().call();
        assert(players.length === 0);
    });
});