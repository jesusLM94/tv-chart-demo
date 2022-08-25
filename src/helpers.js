const candleIntervals = {
  MINUTE_1: "1",
  MINUTE_5: "5",
  HOUR_1: "60",
  DAY_1: "1D",
}

export const makeBittrexApiRequest = async (path) => {
  try {
    const response = await fetch(`v3/${path}`);
    return response.json();
  } catch(error) {
    throw new Error(`Bittrex request error: ${error.status}`);
  }
}


// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
  const short = `${fromSymbol}/${toSymbol}`;
  return {
    short,
    full: `${exchange}:${short}`,
  };
}

export const getCandlesInRange = async (from, to, interval, symbol) => {
  let candlesInRange = []
  // Multiply by 1000 to convert from unix timestamp to milliseconds
  const fromDate = new Date(from * 1000)
  const toDate = new Date(to * 1000)
  const marketSymbol = symbol.replace('/', '-')

  // First we bring recent candles from the API
  const recentCandles = await makeBittrexApiRequest(`markets/${marketSymbol}/candles/TRADE/${interval}/recent`)


  /** Recent candles that meet date criteria asked from TV Chart */
  candlesInRange = recentCandles.filter(
    candle => new Date(candle.startsAt) >= fromDate && new Date(candle.startsAt) <= toDate,
  )

  /** Return requested data if exist */
  if (candlesInRange.length) {
    return candlesInRange
  }

  const lastOldDate = new Date(recentCandles[0].startsAt)

  /****
   * IMPLEMENT GET HISTORICAL CANDLES FROM API
  // We get historical data if the "lastOldDate" recorded date is newer than the requested "fromDate"
  if (lastOldDate > fromDate) {
    // We get the historical candles using from(date) and lastOldDate(date) because to(date) sometimes is older than
    // the lastOldDate stored for that market so with that way we won't lose the date continuity on the chart
  }

   /// Filter using the same range above
   candlesInRange = marketCandleHistory.candles.filter(
   candle =>
   new Date(candle.startsAt) >= fromDate && new Date(candle.startsAt) < lastOldDate,
   )
  *////

}
