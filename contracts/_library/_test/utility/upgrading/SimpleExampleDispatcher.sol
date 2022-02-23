// SPDX-License-Identifier: MIT
// SettleMint.com
pragma solidity ^0.8.0;

import "../../../utility/upgrading/Dispatcher.sol";
import "../../../authentication/Secured.sol";

/* Dispatcher for Example contracts */
contract SimpleExampleDispatcher is Dispatcher {
  constructor(address _gateKeeper) Dispatcher(_gateKeeper) {}
}
