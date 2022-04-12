// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// solhint-disable not-rely-on-time

abstract contract BptVesting {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // category
    enum CategoryNames {EMPTY, SALE_CATEGORY}
    struct CategoryType {
        uint256 totalSteps;
        uint256 stepTime;             // unix format
        uint256 tgePercent;           // decimals = 6
        uint256 stepStageDelay;       // unix format
        uint256 stepPercent;          // decimals = 6
    }
    uint256 constant public VESTING_DECIMALS_DIVISOR = 1e6;
    mapping(CategoryNames => CategoryType) public categories;

    // investors
    mapping(address => uint256) public alreadyRewarded;

    // contract settings
    bool public inited;
    address public token;
    bytes32 public mercleRoot;
    uint256 public tgeTimestamp;

    // claim state
    mapping(address => bool) public tgeIsClaimed;
    mapping(address => uint256) public lastClaimedStep;

    event Claim(
        address indexed target,
        uint256 indexed category,
        uint256 amount,
        bytes32[] merkleProof,
        uint256 resultReward,
        uint256 timestamp
    );
    event TgeClaim(address indexed target, uint256 resultReward, uint256 timestamp);
    event StepClaim(address target, uint256 step, uint256 reward, uint256 timestamp);

    function checkClaim(address _target, uint256 _category, uint256 _amount, bytes32[] calldata _merkleProof) external view returns(bool) {
        return (_verify(_target, _category, _amount, _merkleProof));
    }

    function claim(uint256 _category, uint256 _amount, bytes32[] calldata _merkleProof) external returns(uint256 _claimResult) {
        require(inited, "BptVesting: not inited");
        require(_verify(msg.sender, _category, _amount, _merkleProof), "BptVesting: invalid proof or wrong data");
        require(CategoryNames(_category) != CategoryNames.EMPTY, "BptVesting: invalid category");
        require(_amount > 0, "BptVesting: invalid amount");
        require(block.timestamp >= tgeTimestamp, "BptVesting: TGE has not started yet");

        CategoryType memory category = categories[CategoryNames(_category)];

        uint256 reward = 0;

        // claim TGE reward
        if (!tgeIsClaimed[msg.sender]) {
            reward = reward.add(_amount.mul(category.tgePercent).div(VESTING_DECIMALS_DIVISOR));
            tgeIsClaimed[msg.sender] = true;

            emit TgeClaim(msg.sender, reward, block.timestamp);
        }

        // claim steps
        uint256 stepStageStartTime = tgeTimestamp.add(category.stepStageDelay);
        uint256 vestingStep;

        for (uint256 i = lastClaimedStep[msg.sender]; i < category.totalSteps; i++) {

            if (stepStageStartTime.add(category.stepTime.mul(i)) <= block.timestamp) {
                vestingStep = i.add(1);
                uint256 addedAmount = _amount.mul(category.stepPercent).div(VESTING_DECIMALS_DIVISOR);
                reward = reward.add(addedAmount);

                emit StepClaim(msg.sender, i, addedAmount, block.timestamp);
            } else {
                break;
            }
        }

        require(reward > 0, "BptVesting: no tokens to claim");

        lastClaimedStep[msg.sender] = vestingStep;

        uint256 rewarded = alreadyRewarded[msg.sender];
        uint256 resultReward = 0;

        // if reward overlimit (security check)
        if (rewarded.add(reward) > _amount) {
            resultReward = _amount.sub(rewarded, "BptVesting: no tokens to claim (security check)");
        } else {
            resultReward = reward;
        }

        alreadyRewarded[msg.sender] = alreadyRewarded[msg.sender].add(resultReward);
        IERC20(token).safeTransfer(msg.sender, resultReward);

        emit Claim(msg.sender, _category, _amount, _merkleProof, resultReward, block.timestamp);

        return(resultReward);
    }

    function _verify(address _target, uint256 _category, uint256 _amount, bytes32[] memory _merkleProof) internal view returns(bool) {
        bytes32 node = keccak256(abi.encodePacked(_target, _category, _amount));
        return(MerkleProof.verify(_merkleProof, mercleRoot, node));
    }
}
