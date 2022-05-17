// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting1Seed is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting1Seed: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting1Seed: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting1Seed: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (75000 + 10000 * 93) / 1e6 = 1.005 ==> 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 93,
            stepTime: 7 days,
            tgePercent: 75000,
            stepStageDelay: 7 days,
            stepPercent: 10000
        });

        inited = true;
    }
}
