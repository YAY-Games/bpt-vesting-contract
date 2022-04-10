// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting3YayHolders.sol";

contract BptVesting3YayHoldersMock is BptVesting3YayHolders {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting3YayHolders(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 7 days,
            tgePercent: 100000,
            stepStageDelay: 0,
            stepPercent: 15000
        });
    }
}