const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const { expect } = require('chai');
const { BN, expectRevert, expectEvent, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { advanceBlockAndSetTime } = require('./helpers/standingTheTime');

const ERC20Mock = artifacts.require('ERC20Mock');
const BptVesting1SeedMock = artifacts.require('BptVesting1SeedMock');
const BptVesting1Seed = artifacts.require('BptVesting1Seed');

const DAY = 86400;
const STEP_COUNT = 3;
const VESTING_DECIMALS_DIVISOR = 1e6;

contract('BptVesting1Seed', function (accounts) {

    async function claimInAllCases(rewardAfterTge, stepReward, deltaTime, accountPos) {
    
        it('before TGE', async function () {
            await advanceBlockAndSetTime(this.tgeTimestamp - 1*DAY);
    
            const proof = this.merkleTree.getHexProof(this.elems[accountPos]);
            await expectRevert(
                this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}),
                'BptVesting: TGE has not started yet',
            ); 
        });

        it('after TGE', async function () {
            const proof = this.merkleTree.getHexProof(this.elems[accountPos]);

            const targetTime = this.tgeTimestamp;
            await advanceBlockAndSetTime(targetTime);

            let result = (await this.BptVesting1Seed.claim.call(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}));
            let expectedReward = this.balances[accountPos][2].mul(rewardAfterTge).div(new BN(VESTING_DECIMALS_DIVISOR));

            await assert.equal(
                result.toString(),
                expectedReward.toString()
            );
            expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[accountPos]))).to.equal(false);
            expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[accountPos])).toString()).to.equal("0");
            expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[accountPos])).toString()).to.equal("0");
            
            let txReceipt = await this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]});

            expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[accountPos]))).to.equal(true);
            expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[accountPos])).toString()).to.equal("0");
            expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[accountPos])).toString()).to.equal(expectedReward.toString());

            await expectEvent(txReceipt, "Claim", {
                target: accounts[accountPos],
                category: this.balances[accountPos][1].toString(),
                amount: this.balances[accountPos][2].toString(),
                resultReward: result
            });
            await expectEvent(txReceipt, "TgeClaim", {
                target: accounts[accountPos],
                resultReward: result
            });

            await advanceBlockAndSetTime(targetTime + 1);

            await expectRevert(
                this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}),
                'BptVesting: no tokens to claim',
            );
        });

        it('after TGE + step', async function () {
            const proof = this.merkleTree.getHexProof(this.elems[accountPos]);

            const targetTime = this.stepStageTimestamp;
            await advanceBlockAndSetTime(targetTime);

            let result = (await this.BptVesting1Seed.claim.call(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}));
            let expectedReward = ((this.balances[accountPos][2].mul(rewardAfterTge)).add(this.balances[accountPos][2].mul(stepReward))).div(new BN(VESTING_DECIMALS_DIVISOR));

            await assert.equal(
                result.toString(),
                expectedReward.toString()
            );
            expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[accountPos]))).to.equal(false);
            expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[accountPos])).toString()).to.equal("0");
            expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[accountPos])).toString()).to.equal("0");
            
            let txReceipt = await this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]});

            expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[accountPos]))).to.equal(true);
            expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[accountPos])).toString()).to.equal("1");
            expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[accountPos])).toString()).to.equal(expectedReward.toString());

            await expectEvent(txReceipt, "Claim", {
                target: accounts[accountPos],
                category: this.balances[accountPos][1].toString(),
                amount: this.balances[accountPos][2].toString(),
                resultReward: result
            });
            await expectEvent(txReceipt, "TgeClaim", {
                target: accounts[accountPos],
                resultReward: (this.balances[accountPos][2].mul(rewardAfterTge)).div(new BN(VESTING_DECIMALS_DIVISOR))
            });

            await advanceBlockAndSetTime(targetTime + deltaTime);
            
            await this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]});
            await expectRevert(
                this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}),
                'BptVesting: no tokens to claim',
            );
        });

        for (let i = 0; i < (STEP_COUNT + 1); i++) {
            for (let j = 1; j < 2**i; j++) {
                let a = [];
                for (let k = 1; k < i; k++) {
                    if ((j >> k) & 1) {
                        a.push(k);
                    }
                }
                a.push(i)
                
                let testMsg;
                if (i == 0) {
                    testMsg = 'after tge';
                } else {
                    testMsg = `step ${i}, variant ${a}`;
                }

                it(testMsg, async function () {
                    const proof = this.merkleTree.getHexProof(this.elems[accountPos]);

                    let totalClaimed = new BN("0");
                    let afterTgeValue = this.balances[accountPos][2].mul(rewardAfterTge).div(new BN(VESTING_DECIMALS_DIVISOR));
                    // let afterNextStageValue = afterTgeValue.add(this.balances[accountPos][2].mul(rewardNextStage).div(new BN(VESTING_DECIMALS_DIVISOR)));
                    for (const elem of a) {
                        await advanceBlockAndSetTime(this.stepStageTimestamp + deltaTime * (elem-1));
                        let result = (await this.BptVesting1Seed.claim.call(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}));
                        let expectedReward;

                        if (elem == 0) {
                            // expectedReward = afterNextStageValue;
                        } else {
                            expectedReward = (this.balances[accountPos][2].mul(stepReward).mul(new BN(elem))).div(new BN(VESTING_DECIMALS_DIVISOR)).add(afterTgeValue).sub(totalClaimed);
                        }

                        await assert.equal(
                            result.toString(),
                            expectedReward.toString()
                        );

                        totalClaimed = totalClaimed.add(result);

                        await this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]});
                        expect((await this.token.balanceOf.call(accounts[accountPos])).toString()).to.equal(totalClaimed.toString());

                        await expectRevert(
                            this.BptVesting1Seed.claim(this.balances[accountPos][1], this.balances[accountPos][2], proof, {from: accounts[accountPos]}),
                            'BptVesting: no tokens to claim',
                        );
                    }
                });  
            }
        }
    }

    before(function() {
        this.balances = [
            [accounts[0], 1, new BN(web3.utils.toWei("10000","ether"))],
            [accounts[1], 1, new BN(web3.utils.toWei("15000","ether"))],
            [accounts[2], 1, new BN(web3.utils.toWei("20000","ether"))],
            [accounts[3], 1, new BN(web3.utils.toWei("30000","ether"))],
            [accounts[4], 0, new BN(web3.utils.toWei("30000","ether"))],
            [accounts[5], 1, new BN(web3.utils.toWei("0","ether"))],
            [accounts[6], 1, new BN(web3.utils.toWei("100000","ether"))],
            [accounts[7], 1, new BN(web3.utils.toWei("100000","ether"))],
        ];
        
        this.elems = [];
        this.balances.forEach(element => {
            let hash = web3.utils.soliditySha3(element[0], element[1], element[2]);
            this.elems.push(hash);
        });

        this.merkleTree = new MerkleTree(this.elems, keccak256, { hashLeaves: false, sortPairs: true });

        this.merkleRoot = this.merkleTree.getHexRoot();
    });

    describe('constructor', function () {

        beforeEach(async function () {
            this.totalTokens = web3.utils.toWei("1000","ether");
            this.token = await ERC20Mock.new("BPT token", "BPT", this.totalTokens);

            this.tgeTimestamp = (await web3.eth.getBlock('latest')).timestamp + 5;

            this.BptVesting1Seed = await BptVesting1Seed.new(
                this.token.address,
                this.merkleRoot,
                this.tgeTimestamp
            );
        });

        it('positive', async function () {
            expect(await this.BptVesting1Seed.token.call()).to.equal(this.token.address);
            expect(await this.BptVesting1Seed.mercleRoot.call()).to.equal(this.merkleRoot);
            expect((await this.BptVesting1Seed.tgeTimestamp.call()).toNumber()).to.equal(this.tgeTimestamp);
            
        });

        it('negative', async function () {
            await expectRevert(
                BptVesting1Seed.new(
                    this.token.address,
                    this.merkleRoot,
                    this.tgeTimestamp - 10
                ),
                "BptVesting1Seed: wrong TGE timestamp",
            );
            await expectRevert(
                BptVesting1Seed.new(
                    ZERO_ADDRESS,
                    this.merkleRoot,
                    this.tgeTimestamp
                ),
                "BptVesting1Seed: zero token address",
            );
            await expectRevert(
                BptVesting1Seed.new(
                    this.token.address,
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    this.tgeTimestamp
                ),
                "BptVesting1Seed: zero mercle root",
            );
        });

    });

    describe('mock contract', function () {
        beforeEach(async function () {
            this.totalTokens = web3.utils.toWei("100000000000","ether");
            this.token = await ERC20Mock.new("BPT token", "BPT", this.totalTokens);
    
            this.tgeTimestamp = (await web3.eth.getBlock('latest')).timestamp + 5;
            this.stepStageTimestamp = this.tgeTimestamp + 120 * DAY;
            this.BptVesting1Seed = await BptVesting1SeedMock.new(
                this.token.address,
                this.merkleRoot,
                this.tgeTimestamp,
                STEP_COUNT
            );
    
            await this.token.transfer(this.BptVesting1Seed.address, this.totalTokens);
        });

        describe('vesting by categories', function () {
            describe('SALE', function () {
                claimInAllCases(
                    new BN("75000"),
                    new BN("10000"),
                    7*DAY,
                    0
                );
            });
        });
    });

    describe('real contract', function () {
        beforeEach(async function () {
            this.totalTokens = web3.utils.toWei("100000000000","ether");
            this.token = await ERC20Mock.new("BPT token", "BPT", this.totalTokens);
    
            this.tgeTimestamp = (await web3.eth.getBlock('latest')).timestamp + 20;
            this.BptVesting1Seed = await BptVesting1Seed.new(
                this.token.address,
                this.merkleRoot,
                this.tgeTimestamp
            );
    
            await this.token.transfer(this.BptVesting1Seed.address, this.totalTokens);
        });

        describe('verify', function () {
            it('positive proof', async function () {
                const proof1 = this.merkleTree.getHexProof(this.elems[0]);
                const result1 = await this.BptVesting1Seed.checkClaim(this.balances[0][0], this.balances[0][1], this.balances[0][2], proof1)
                expect(result1).to.equal(true);
    
                const proof2 = this.merkleTree.getHexProof(this.elems[1]);
                const result2 = await this.BptVesting1Seed.checkClaim(this.balances[1][0], this.balances[1][1], this.balances[1][2], proof2)
                expect(result2).to.equal(true);
    
                const proof3 = this.merkleTree.getHexProof(this.elems[2]);
                const result3 = await this.BptVesting1Seed.checkClaim(this.balances[2][0], this.balances[2][1], this.balances[2][2], proof3)
                expect(result3).to.equal(true);
    
                const proof4 = this.merkleTree.getHexProof(this.elems[3]);
                const result4 = await this.BptVesting1Seed.checkClaim(this.balances[3][0], this.balances[3][1], this.balances[3][2], proof4)
                expect(result4).to.equal(true);
            });
            it('negative proof', async function () {
                const proof1 = this.merkleTree.getHexProof(this.elems[0]);
                const result1 = await this.BptVesting1Seed.checkClaim(this.balances[1][0], this.balances[0][1], this.balances[0][2], proof1)
                expect(result1).to.equal(false);
    
                const proof2 = this.merkleTree.getHexProof(this.elems[1]);
                const result2 = await this.BptVesting1Seed.checkClaim(this.balances[0][0], this.balances[1][1], this.balances[1][2], proof2)
                expect(result2).to.equal(false);
            });
        });

        describe('claim', function () {
            it('negative cases', async function () {
                const proof1 = this.merkleTree.getHexProof(this.elems[0]);
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[1][1], this.balances[1][2], proof1, {from: accounts[0]}),
                    'BptVesting: invalid proof or wrong data',
                );
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[0][1], this.balances[0][2], proof1, {from: accounts[1]}),
                    'BptVesting: invalid proof or wrong data',
                );
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[0][1], this.balances[0][2], proof1, {from: accounts[0]}),
                    'BptVesting: TGE has not started yet',
                );

                const proof2 = this.merkleTree.getHexProof(this.elems[4]);
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[4][1], this.balances[4][2], proof2, {from: accounts[4]}),
                    'BptVesting: invalid category',
                );

                const proof3 = this.merkleTree.getHexProof(this.elems[5]);
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[5][1], this.balances[5][2], proof3, {from: accounts[5]}),
                    'BptVesting: invalid amount',
                );
            });

            it('after deadline', async function () {
                const proof = this.merkleTree.getHexProof(this.elems[0]);
    
                await advanceBlockAndSetTime(this.tgeTimestamp + 1000 * DAY);
    
                let result = (await this.BptVesting1Seed.claim.call(this.balances[0][1], this.balances[0][2], proof, {from: accounts[0]}));
                let expectedReward = this.balances[0][2];
    
                await assert.equal(
                    result.toString(),
                    expectedReward.toString()
                );
                expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[0]))).to.equal(false);
                expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[0])).toString()).to.equal("0");
                expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[0])).toString()).to.equal("0");
                
                let txReceipt = await this.BptVesting1Seed.claim(this.balances[0][1], this.balances[0][2], proof, {from: accounts[0]});
    
                expect((await this.BptVesting1Seed.tgeIsClaimed.call(accounts[0]))).to.equal(true);
                expect((await this.BptVesting1Seed.lastClaimedStep.call(accounts[0])).toString()).to.equal("93");
                expect((await this.BptVesting1Seed.alreadyRewarded.call(accounts[0])).toString()).to.equal(expectedReward.toString());
    
                await expectEvent(txReceipt, "Claim", {
                    target: accounts[0],
                    category: this.balances[0][1].toString(),
                    amount: this.balances[0][2].toString(),
                    resultReward: result
                });
    
                await advanceBlockAndSetTime(this.tgeTimestamp + 1000 * DAY);
    
                await expectRevert(
                    this.BptVesting1Seed.claim(this.balances[0][1], this.balances[0][2], proof, {from: accounts[0]}),
                    'BptVesting: no tokens to claim',
                );
            });
        });

    });
});