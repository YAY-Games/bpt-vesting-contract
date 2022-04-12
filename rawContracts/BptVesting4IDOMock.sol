// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting4IDO.sol";

contract BptVesting4IDOMock is BptVesting4IDO {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting4IDO(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 7 days,
            tgePercent: 300000,
            stepStageDelay: 0,
            stepPercent: 17500
        });
    }
}