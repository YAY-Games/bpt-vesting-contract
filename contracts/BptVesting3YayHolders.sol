// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting3YayHolders is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting3YayHolders: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting3YayHolders: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting3YayHolders: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (100000 + 15000 * 60) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 60,
            stepTime: 7 days,
            tgePercent: 100000,
            stepStageDelay: 7 days,
            stepPercent: 15000
        });

        inited = true;
    }
}
