// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting10Team.sol";

contract BptVesting10TeamMock is BptVesting10Team {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting10Team(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 30 days,
            tgePercent: 40000,
            stepStageDelay: 0,
            stepPercent: 40000
        });
    }
}