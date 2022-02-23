// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineRegistry.sol";

/**
 * @title Registry contract for vehicle state machines
 */
contract TraceabilityRegistry is StateMachineRegistry {
  constructor(address gatekeeper) StateMachineRegistry(gatekeeper) {}
}
