// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/RoleRegistry.sol";

contract NotaryRoleRegistry is RoleRegistry {
  bytes32 public constant ROLE_NOTARY = "ROLE_NOTARY";

  constructor(address gatekeeper) RoleRegistry(gatekeeper) {}

  /**
   * @dev Returns the role
   * @return A bytes32 role
   */
  function role() public pure returns (bytes32) {
    return ROLE_NOTARY;
  }
}
