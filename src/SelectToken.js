import React from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

const GET_TOKENS = gql`
  {
    tokens {
      id
      symbol
      address
    }
  }
`;

export function SelectToken({ onTokenSelected, value }) {
  const { loading, error, data } = useQuery(GET_TOKENS);

  if (loading) return "Loading tokens...";
  if (error) return `Error! ${error.message}`;

  const tokens = data ? data.tokens.sort(_sortTokens) : [];

  return (
    <select name="token" onChange={onTokenSelected} value={value}>
      {tokens.map(token => (
        <option key={token.id} value={token.id}>
          {token.symbol || token.address}
        </option>
      ))}
    </select>
  );
}

function _sortTokens(token1, token2) {
  const value1 = (token1.symbol || token1.address).toUpperCase();
  const value2 = (token2.symbol || token2.address).toUpperCase();

  let comparison = 0;
  if (value1 > value2) {
    comparison = 1;
  } else if (value1 < value2) {
    comparison = -1;
  }
  return comparison;
}

export default SelectToken;
