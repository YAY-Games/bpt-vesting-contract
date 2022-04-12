// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting11Eco.sol";

contract BptVesting11EcoMock is BptVesting11Eco {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting11Eco(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 30 days,
            tgePercent: 40000,
            stepStageDelay: 0,
            stepPercent: 40000
        });
    }
}