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

  return (
    <select name="token" onChange={onTokenSelected} value={value}>
      {data.tokens.map(token => (
        <option key={token.id} value={token.id}>
          {token.symbol || token.address}
        </option>
      ))}
    </select>
  );
}

export default SelectToken;
