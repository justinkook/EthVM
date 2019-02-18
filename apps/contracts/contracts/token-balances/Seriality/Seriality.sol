pragma solidity 0.5.0;

/**
 * @title Seriality
 * @dev The Seriality contract is the main interface for serializing data using the TypeToBytes, BytesToType
 * @author pouladzade@gmail.com
 */

import "./BytesToTypes.sol";
import "./TypesToBytes.sol";


contract Seriality is BytesToTypes, TypesToBytes {

    constructor() public {

    }
}
