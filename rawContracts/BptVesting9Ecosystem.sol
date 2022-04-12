// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting9Ecosystem is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting9Ecosystem: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting9Ecosystem: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting9Ecosystem: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (25000 + 25000 * 39) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 39,
            stepTime: 30 days,
            tgePercent: 25000,
            stepStageDelay: 0,
            stepPercent: 25000
        });

        inited = true;
    }
}
