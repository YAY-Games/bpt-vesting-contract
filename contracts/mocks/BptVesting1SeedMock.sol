// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting1Seed.sol";

contract BptVesting1SeedMock is BptVesting1Seed {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) BptVesting1Seed(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 7 days,
            tgePercent: 75000,
            stepStageDelay: 120 days,
            stepPercent: 10000
        });
    }
}