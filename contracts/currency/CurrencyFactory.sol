// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/tokens/ERC20/ERC20TokenFactory.sol";
import "./Currency.sol";

/**
 * @title Factory contract for ERC20-based currency token
 */
contract CurrencyFactory is ERC20TokenFactory {
  constructor(address registry, address gk) ERC20TokenFactory(registry, gk) {}

  /**
   * @notice Factory method to create new ERC20-based currency token.
   * @dev Restricted to user with the "CREATE_TOKEN_ROLE" permission.
   * @param name bytes32
   * @param decimals bytes32
   */
  function createToken(string memory name, uint8 decimals)
    public
    authWithCustomReason(CREATE_TOKEN_ROLE, "Sender needs CREATE_TOKEN_ROLE")
  {
    Currency newToken = new Currency(name, decimals, address(gateKeeper), _uiFieldDefinitionsHash);
    _tokenRegistry.addToken(name, address(newToken));
    emit TokenCreated(address(newToken), name);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("MINT_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("BURN_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("UPDATE_METADATA_ROLE"), msg.sender);
    gateKeeper.createPermission(msg.sender, address(newToken), bytes32("EDIT_ROLE"), msg.sender);
  }
}
