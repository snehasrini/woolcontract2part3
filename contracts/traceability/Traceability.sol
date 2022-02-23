// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/Secured.sol";
import "../_library/provenance/statemachine/StateMachine.sol";
import "../_library/utility/metadata/IpfsFieldContainer.sol";
import "../_library/utility/metadata/FileFieldContainer.sol";
import "../_library/utility/conversions/Converter.sol";

/**
 * Generic
 *
 * A generic package exists of
 *  - a description of the generic state machine
 *
 * @title Traceability machine implementation
 */
contract Traceability is Converter, StateMachine, IpfsFieldContainer, FileFieldContainer {
  bytes32 public constant STATE_ONE = "Harvest";
  bytes32 public constant STATE_TWO = "Malting";
  bytes32 public constant STATE_THREE = "Brewing";
  bytes32 public constant STATE_FOUR = "Fermentation";
  bytes32 public constant STATE_FIVE = "Maturation";
  bytes32 public constant STATE_SIX = "Bottling";
  bytes32 public constant STATE_SEVEN = "Final Beer";

  bytes32 public constant ROLE_ADMIN = "ROLE_ADMIN";
  bytes32 public constant ROLE_ONE = "Farmer";
  bytes32 public constant ROLE_TWO = "Maltster";
  bytes32 public constant ROLE_THREE = "Brewer";

  bytes32[] public _roles = [ROLE_ADMIN];

  string public _uiFieldDefinitionsHash;
  uint256 public _harvestDate;
  uint256 public _maltingDate;
  uint256 public _brewingDate;
  uint256 public _fermentationDate;
  uint256 public _maturationDate;
  uint256 public _bottlingDate;

  constructor(
    address gateKeeper,
    uint256 harvestDate,
    string memory ipfsFieldContainerHash,
    string memory uiFieldDefinitionsHash
  ) Secured(gateKeeper) {
    _harvestDate = harvestDate;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
    _uiFieldDefinitionsHash = uiFieldDefinitionsHash;
    setupStateMachine();
  }

  /**
   * @notice Updates state machine properties
   * @param harvestDate the first parameter of the state machine
   * @param ipfsFieldContainerHash ipfs hash of vehicle metadata
   */
  function edit(uint256 harvestDate, string memory ipfsFieldContainerHash) public {
    _harvestDate = harvestDate;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
  }

  function addMaltingDate(uint256 maltingDate) public {
    _maltingDate = maltingDate;
  }

  function getMaltingDate() public returns (uint256) {
    return _maltingDate;
  }

  function addBrewingDate(uint256 brewingDate) public {
    _brewingDate = brewingDate;
  }

  function getBrewingDate() public returns (uint256) {
    return _brewingDate;
  }

  function addFermentationDate(uint256 fermentationDate) public {
    _fermentationDate = fermentationDate;
  }

  function getFermentationDate() public returns (uint256) {
    return _fermentationDate;
  }

  function addMaturationDate(uint256 maturationDate) public {
    _maturationDate = maturationDate;
  }

  function getMaturationDate() public returns (uint256) {
    return _maturationDate;
  }

  function addBottlingDate(uint256 bottlingDate) public {
    _bottlingDate = bottlingDate;
  }

  function getBottlingDate() public returns (uint256) {
    return _bottlingDate;
  }

  /**
   * @notice Returns all the roles for this contract
   * @return bytes32[] array of raw bytes representing the roles
   */
  function getRoles() public view returns (bytes32[] memory) {
    return _roles;
  }

  function setupStateMachine() internal override {
    //create all states
    createState(STATE_ONE);
    createState(STATE_TWO);
    createState(STATE_THREE);
    createState(STATE_FOUR);
    createState(STATE_FIVE);
    createState(STATE_SIX);
    createState(STATE_SEVEN);

    // add properties
    // STATE_ONE
    addNextStateForState(STATE_ONE, STATE_TWO);
    addRoleForState(STATE_ONE, ROLE_ADMIN);
    addRoleForState(STATE_ONE, ROLE_ONE);

    // STATE_TWO
    addNextStateForState(STATE_TWO, STATE_THREE);
    addAllowedFunctionForState(STATE_TWO, this.addMaltingDate.selector);
    addRoleForState(STATE_TWO, ROLE_ADMIN);
    addRoleForState(STATE_TWO, ROLE_TWO);

    // STATE_THREE
    addNextStateForState(STATE_THREE, STATE_FOUR);
    addAllowedFunctionForState(STATE_THREE, this.addBrewingDate.selector);
    addRoleForState(STATE_THREE, ROLE_ADMIN);
    addRoleForState(STATE_THREE, ROLE_THREE);

    // STATE_FOUR
    addNextStateForState(STATE_FOUR, STATE_FIVE);
    addAllowedFunctionForState(STATE_FOUR, this.addFermentationDate.selector);
    addRoleForState(STATE_FOUR, ROLE_ADMIN);
    addRoleForState(STATE_FOUR, ROLE_THREE);

    // STATE_FIVE
    addNextStateForState(STATE_FIVE, STATE_SIX);
    addAllowedFunctionForState(STATE_FIVE, this.addMaturationDate.selector);
    addRoleForState(STATE_FIVE, ROLE_ADMIN);
    addRoleForState(STATE_FIVE, ROLE_THREE);

    // STATE_SIX
    addNextStateForState(STATE_SIX, STATE_SEVEN);
    addAllowedFunctionForState(STATE_SIX, this.addBottlingDate.selector);
    addRoleForState(STATE_SIX, ROLE_ADMIN);
    addRoleForState(STATE_SIX, ROLE_THREE);

    // STATE_SEVEN
    addRoleForState(STATE_SEVEN, ROLE_ADMIN);
    addRoleForState(STATE_SEVEN, ROLE_THREE);

    setInitialState(STATE_ONE);
  }
}
