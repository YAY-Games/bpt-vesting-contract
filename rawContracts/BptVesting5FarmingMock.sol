// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting5Farming.sol";

contract BptVesting5FarmingMock is BptVesting5Farming {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting5Farming(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 7 days,
            tgePercent: 100000,
            stepStageDelay: 0,
            stepPercent: 15000
        });
    }
}