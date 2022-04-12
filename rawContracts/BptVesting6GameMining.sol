// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./lib/BptVesting.sol";

// solhint-disable not-rely-on-time

contract BptVesting6GameMining is BptVesting {
    constructor(address _token, bytes32 _mercleRoot, uint256 _tgeTimestamp) {
        require(_token != address(0), "BptVesting6GameMining: zero token address");
        require(_mercleRoot != bytes32(0), "BptVesting6GameMining: zero mercle root");
        require(_tgeTimestamp >= block.timestamp, "BptVesting6GameMining: wrong TGE timestamp");

        token = _token;
        mercleRoot = _mercleRoot;
        tgeTimestamp = _tgeTimestamp;

        // rounds settings
        // (50000 + 25000 * 38) / 1e6 = 1.0
        categories[CategoryNames.SALE_CATEGORY] = CategoryType({
            totalSteps: 38,
            stepTime: 30 days,
            tgePercent: 50000,
            stepStageDelay: 0,
            stepPercent: 25000
        });

        inited = true;
    }
}
