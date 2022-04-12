// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../BptVesting7BPLabs.sol";

contract BptVesting7BPLabsMock is BptVesting7BPLabs {
    constructor(
        address _token,
        bytes32 _mercleRoot,
        uint256 _tgeTimestamp,
        uint256 steps
    ) public BptVesting7BPLabs(_token, _mercleRoot, _tgeTimestamp) {
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: steps,
            stepTime: 30 days,
            tgePercent: 25000,
            stepStageDelay: 0,
            stepPercent: 25000
        });
    }
}