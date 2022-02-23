// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineRegistry.sol";

/**
 * @title Registry contract for supplychainfinance state machines
 */
contract KnowYourBusinessRegistry is StateMachineRegistry {
  constructor(address gatekeeper) StateMachineRegistry(gatekeeper) {}
}
