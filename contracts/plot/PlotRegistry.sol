// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineRegistry.sol";

contract PlotRegistry is StateMachineRegistry {
  constructor(address gatekeeper) StateMachineRegistry(address(gateKeeper)) {}
}
