// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineRegistry.sol";

/**
 * @title Registry contract for stateful bond state machines
 */
contract StatefulBondRegistry is StateMachineRegistry {
  constructor(address gateKeeper) StateMachineRegistry(gateKeeper) {}
}
