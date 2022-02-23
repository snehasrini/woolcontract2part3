// SPDX-License-Identifier: MIT
// SettleMint.com
pragma solidity ^0.8.0;

abstract contract IERC777TokenSender {
  function tokensToSend(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes memory userData,
    bytes memory operatorData
  ) public virtual;
}
