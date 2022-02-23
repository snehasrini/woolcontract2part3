// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/tokens/ERC20/ERC20Token.sol";

/**
 * @title A fungible, ERC20-based token
 */
contract Share is ERC20Token {
  constructor(
    string memory name,
    uint8 decimals,
    address gateKeeper,
    string memory uiFieldDefinitionsHash
  ) ERC20Token(name, decimals, gateKeeper, uiFieldDefinitionsHash) {}

  bytes32 public constant EDIT_ROLE = "EDIT_ROLE";

  function getDecimalsFor(
    bytes memory /*fieldName*/
  ) public view override returns (uint256) {
    return _decimals;
  }

  /**
   * @notice Updates the token's name and number of decimals
   * @dev Restricted to user with the "EDIT_ROLE" permission
   * @param name the token's new name
   * @param decimals the token's new number of decimals
   */
  function edit(string memory name, uint8 decimals) public auth(EDIT_ROLE) {
    _name = name;
    _decimals = decimals;
  }

  /**
   * @notice Returns the amount of tokenholders recorded in this contract
   * @dev Gets the amount of token holders, used by the middleware to build a cache you can query. You should not need this function in general since iteration this way clientside is very slow.
   * @return length An uint256 representing the amount of tokenholders recorded in this contract.
   */
  function getIndexLength() public view override returns (uint256 length) {
    length = tokenHolders.length;
  }

  /**
   * @notice Returns the address and balance of the tokenholder by index
   * @param index used to access the tokenHolders array
   * @return holder holder's address and balance
   */
  function getByIndex(uint256 index) public view returns (address holder, uint256 balance) {
    holder = tokenHolders[index];
    balance = balances[tokenHolders[index]].balance;
  }

  /**
   * @notice Returns the address and balance of the tokenholder by address
   * @param key used to access the token's balances
   * @return holder holder's address and balance
   */
  function getByKey(address key) public view returns (address holder, uint256 balance) {
    holder = key;
    balance = balances[key].balance;
  }
}
