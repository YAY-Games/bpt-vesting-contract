// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting4IDO is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting4IDO: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting4IDO: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting4IDO: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (300000 + 40 * 17500) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 40,
            stepTime: 7 days,
            tgePercent: 300000,
            stepStageDelay: 0,
            stepPercent: 17500
        });

        inited = true;
    }
}
