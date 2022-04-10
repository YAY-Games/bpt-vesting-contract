// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting2Strategic is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting2Strategic: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting2Strategic: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting2Strategic: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (80000 + 11500 * 80) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 80,
            stepTime: 7 days,
            tgePercent: 80000,
            stepStageDelay: 0,
            stepPercent: 11500
        });

        inited = true;
    }
}
