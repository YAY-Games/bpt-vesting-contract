// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting6GameMining.sol";

contract BptVesting6GameMiningMock is BptVesting6GameMining {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting6GameMining(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 30 days,
            tgePercent: 50000,
            stepStageDelay: 0,
            stepPercent: 25000
        });
    }
}