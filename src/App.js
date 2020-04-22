import React, { useState } from "react";
import PricesChart from "./PricesChart";
import SelectToken from "./SelectToken";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient, { InMemoryCache } from "apollo-boost";

import "./styles.css";

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/gnosis/protocol",
  cache: new InMemoryCache()
});

const DEFAULT_TOKEN = 1;

export default function App() {
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN);
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Gnosis Protocol prices</h1>
        <SelectToken
          onTokenSelected={e => {
            const tokenId = e.target.value;
            console.log("Select token id", tokenId);
            setTokenId(tokenId);
          }}
          value={tokenId}
        />
        <PricesChart tokenId={tokenId} />
      </div>
    </ApolloProvider>
  );
}
