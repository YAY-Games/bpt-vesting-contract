// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting2Strategic.sol";

contract BptVesting2StrategicMock is BptVesting2Strategic {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting2Strategic(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 7 days,
            tgePercent: 80000,
            stepStageDelay: 7,
            stepPercent: 11500
        });
    }
}