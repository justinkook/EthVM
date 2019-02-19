pragma solidity ^0.5.0;

import "./Seriality/Seriality.sol";
import "./PublicTokens.sol";


contract TokenBalances is Seriality {

    struct Token {
        bytes16 name;    // Name of the token
        bytes16 symbol;  // Symbol of the token
        address addr;    // Address of the token contract
        uint8 decimals;  // decimals of the token
        bytes32 website; // website of the token
        bytes32 email;   // support email of the token
        bool isValid;    // whether the token is valid or not
    }

    PublicTokens private tokens;

    constructor(address tokenStorage) public {
        tokens = PublicTokens(tokenStorage);
    }

    function getTokenStorage() public view returns (address) {
        return address(tokens);
    }

    function getTokenBalanceOf(address tokenAddr, address addr) public view returns (uint bal) {
        bytes4 sig = bytes4(keccak256("balanceOf(address)"));

        assembly {
            // move pointer to free memory spot
            let ptr := mload(0x40)

            // put function sig at memory spot
            mstore(ptr, sig)

            // append argument after function sig
            mstore(add(ptr, 0x04), addr)

            let result := staticcall(
                150000,    // gas limit
                tokenAddr, // to addr. append var to _slot to access storage variable
                ptr,       // Inputs are stored at location ptr
                0x24,      // Inputs are 36 bytes long
                ptr,       // Store output over input
                0x20      // Outputs are 32 bytes long
            )

            if iszero(result) {
                bal := 0 // return 0 on error and 0 balance
            }

            if gt(result, 0) {
                bal := mload(ptr) // Assign output to answer var
            }

            mstore(0x40, add(ptr, 0x20)) // Set storage pointer to new space
        }
    }

    function getAllTokenBalances(
        address _owner,
        bool name,
        bool website,
        bool email,
        uint page,
        uint limit
    ) public view returns (bytes memory) {
        assert(limit > 0);

        uint start = page * limit;
        assert(start < tokens.tokenCount());

        // Assert that values are in range

        address tOwner = _owner;
        bool[] memory validTokens = new bool[](limit + 1);
        uint bufferSize = 36; // 32 bytes total number of tokens + 1 byte to define start + 3 bytes to name, website, email
        uint countValidTokens = 0;

        for (uint i = start; i <= tokens.tokenCount(); i++) {
            Token memory token = getToken(i);
            if (token.isValid && isContract(token.addr)) {
                validTokens[i] = true;
                countValidTokens++;
                if (name) bufferSize += 16;
                if (website) bufferSize += 32;
                if (email) bufferSize += 32;
                bufferSize += 69; // address (20) + symbol(16) + balance(32) + decimals(1)
            } else {
                validTokens[i] = false;
            }
            if (countValidTokens == limit) {
                break;
            }
        }

        bytes memory result = new bytes(bufferSize);
        uint offset = bufferSize;

        // serialize
        boolToBytes(offset, true, result);
        offset -= 1;
        uintToBytes(offset, countValidTokens, result);
        offset -= 32;
        boolToBytes(offset, name, result);
        offset -= 1;
        boolToBytes(offset, website, result);
        offset -= 1;
        boolToBytes(offset, email, result);
        offset -= 1;

        for (uint i = 0; i < validTokens.length; i++) {
            if (!validTokens[i]) {
                continue;
            }

            Token memory token = getToken(i);

            bytes16ToBytesR(offset, token.symbol, result);
            offset -= 16;
            addressToBytes(offset, token.addr, result);
            offset -= 20;
            uintToBytes(offset, token.decimals, result);
            offset -= 1;
            uintToBytes(offset, getTokenBalanceOf(token.addr, tOwner), result);
            offset -= 32;
            if (name) {
                bytes16ToBytesR(offset, token.name, result);
                offset -= 16;
            }
            if (website) {
                bytes32ToBytesR(offset, token.website, result);
                offset -= 32;
            }
            if (email) {
                bytes32ToBytesR(offset, token.email, result);
                offset -= 32;
            }
        }

        return result;
    }

    function getToken(uint id) internal view returns (Token memory token) {
        (
            token.name,
            token.symbol,
            token.addr,
            token.decimals,
            token.website,
            token.email,
            token.isValid
        ) = tokens.pubTokens(id);
    }

    function isContract(address addr) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
}
