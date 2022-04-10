// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting10Team is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting10Team: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting10Team: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting10Team: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (40000 + 40000 * 24) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 24,
            stepTime: 30 days,
            tgePercent: 40000,
            stepStageDelay: 0,
            stepPercent: 40000
        });

        inited = true;
    }
}
