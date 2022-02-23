// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/tokens/ERC20/ERC20TokenFactory.sol";
import "./Loan.sol";

/**
 * @title Factory contract for ERC20-based Loan token
 */
contract LoanFactory is ERC20TokenFactory {
  constructor(address registry, address gk) ERC20TokenFactory(registry, gk) {}

  /**
   * @notice Factory method to create new ERC20-based Loan token.
   * @dev Restricted to user with the "CREATE_TOKEN_ROLE" permission.
   * @param name the token's name
   * @param decimals the token's number of decimals
   */
  function createToken(string memory name, uint8 decimals)
    public
    authWithCustomReason(CREATE_TOKEN_ROLE, "Sender needs CREATE_TOKEN_ROLE")
  {
    Loan newToken = new Loan(name, decimals, address(gateKeeper), _uiFieldDefinitionsHash);
    _tokenRegistry.addToken(name, address(newToken));
    emit TokenCreated(address(newToken), name);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("REPAY_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("MINT_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("BURN_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("UPDATE_METADATA_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("EDIT_ROLE"), msg.sender);
  }
}
