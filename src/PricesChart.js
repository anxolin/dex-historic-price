import React, { useEffect, useRef } from "react";
import moment from "moment";
import Chart from "chart.js";
import BigNumber from "bignumber.js";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const LEGEND_FORMAT = "DD MMM YY HH:mm";
const timeFormat = "MMM Do YY";

Chart.defaults.global.animation.duration = 4000;

const GET_PRICES = gql`
  query Prices($tokenId: String!) {
    prices(where: { token: $tokenId }) {
      token {
        symbol
        address
        decimals
      }
      batchId
      volume
      priceInOwlNumerator
      priceInOwlDenominator
      createEpoch
    }
  }
`;

// const GET_PRICES = gql`
//   {
//     prices(where: { token: "1" }) {
//       token {
//         symbol
//         address
//         decimals
//       }
//       batchId
//       volume
//       priceInOwl
//       createEpoch
//     }
//   }
// `;

function drawChart(chartRef, prices) {
  console.log("prices", prices);
  if (prices.length === 0) {
    return;
  }

  const ctx = chartRef.current.getContext("2d");
  window.prices = prices;

  const pricesGroupedByToken = prices.reduce((acc, price) => {
    const tokenAddress = price.token.address;
    let prices = acc[tokenAddress];
    if (!prices) {
      prices = [];
      acc[tokenAddress] = prices;
    }

    prices.push(price);

    return acc;
  }, {});

  // TODO: Show all prices at once + allow to filter
  const filterAddress = Object.keys(pricesGroupedByToken)[0];
  const selectedPrices = pricesGroupedByToken[filterAddress];

  const labels = selectedPrices
    .map(price => price.createEpoch)
    .sort()
    .map(createEpoch => moment.unix(createEpoch).format(LEGEND_FORMAT));

  // TODO: Represent all tokens

  const points = selectedPrices.map(price => {
    const priceInOwl = new BigNumber(price.priceInOwlNumerator).div(
      price.priceInOwlDenominator
    );
    console.log(
      "Price",
      price.priceInOwlNumerator.toString(10),
      price.priceInOwlDenominator.toString(10),
      priceInOwl.toString(10)
    );
    return {
      x: moment(price.createEpoch * 1000).toDate(),
      y: priceInOwl
    };
  });

  const token = selectedPrices[0].token;
  const dataSets = [
    {
      label: token.symbol || token.address,
      data: points,
      backgroundColor: ["rgba(255, 99, 132, 0.2)"],

      /* // scriptable options e.g. green or red!
      backgroundColor: function(context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value < 0 ? 'red' :  // draw negative values in red
            index % 2 ? 'blue' :    // else, alternate values in blue and green
            'green';
    },
    */
      borderColor: ["rgba(255, 99, 132, 1)"],
      borderWidth: 1,
      fill: true
    }
  ];

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: dataSets
    },
    options: {
      // responsive: false
      scales: {
        x: {
          type: "time",
          time: {
            parser: timeFormat,
            // round: 'day'
            tooltipFormat: "ll HH:mm"
          },
          scaleLabel: {
            display: true,
            labelString: "Date"
          }
        }
      },
      hover: {
        mode: "nearest",
        intersect: false
      },
      tooltips: {
        custom: false,
        mode: "nearest",
        intersect: false
      }
    }
  });
}

const PricesChart = ({ tokenId }) => {
  console.log("tokenId1", tokenId, typeof tokenId);
  const { loading, error, data } = useQuery(GET_PRICES, {
    variables: { tokenId: tokenId.toString() }
  });

  const ref = "testchart";
  const chartRef = useRef(ref);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      console.log("Destroying ", chartInstanceRef.current);
      // Destroy the previous instance
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!loading && !error && data) {
      const chart = drawChart(chartRef, data.prices);
      console.log("Save chart", chart);
      chartInstanceRef.current = chart;
    }
  }, [chartRef, data]);

  let errorMessage;
  if (error) {
    console.error("error loading data", error);
    errorMessage = "Error loading data: " + error.message;
  } else if (!loading && data.prices.length === 0) {
    errorMessage = "No data for the selected token";
  }

  return (
    <>
      {errorMessage && (
        <div style={{ color: "red", padding: "5em" }}>{errorMessage}</div>
      )}
      <div className="chart-container">
        <canvas ref={chartRef} id={ref} width="800" height="400"></canvas>
      </div>
    </>
  );
};

export default PricesChart;
