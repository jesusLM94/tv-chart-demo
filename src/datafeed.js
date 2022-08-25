import { generateSymbol, makeBittrexApiRequest, getCandlesInRange } from './helpers.js';

const configurationData = {
  supported_resolutions: ['1D', '1W', '1M'],
  exchanges: [
    {
      value: 'Bittrex',
      name: 'Bittrex',
      desc: 'Bittrex',
    },
  ],
  symbols_types: [
    {
      name: 'crypto',

      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      value: 'crypto',
    },
  ],
};

async function getAllSymbols() {
  const data = await makeBittrexApiRequest("markets")

  return data.map(market => {
    const symbol = generateSymbol("Bittrex", market.baseCurrencySymbol, market.quoteCurrencySymbol);
    return {
      symbol: symbol.short,
      bittrexSymbol: market.symbol,
      full_name: symbol.full,
      description: symbol.short,
      exchange: "Bittrex",
      type: "crypto",
    }
  })
}


export default {
  onReady: (callback) => {
    console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (
    userInput,
    exchange,
    symbolType,
    onResultReadyCallback
  ) => {
    console.log('[searchSymbols]: Method call');
    const symbols = await getAllSymbols();

    const newSymbols = symbols.filter(symbol => {
      const isExchangeValid = exchange === '' || symbol.exchange === exchange;
      const isFullSymbolContainsInput = symbol.full_name
        .toLowerCase()
        .indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  },

  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    console.log('[resolveSymbol]: Method call', symbolName);
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(({full_name}) => full_name === symbolName);
    if (!symbolItem) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
      onResolveErrorCallback('cannot resolve symbol');
      return;
    }

    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
    };

    console.log('[resolveSymbol]: Symbol resolved', symbolName);
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const {from, to, firstDataRequest} = periodParams;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);

    try {
      const data = await getCandlesInRange(from, to, "DAY_1", symbolInfo.name)
      if (data && data === 'Error' || data.length === 0) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], {noData: true});
        return;
      }
      let bars = [];
      data.forEach(bar => {
        bars = [...bars, {
          time: new Date(bar.startsAt).getTime(),
          low: bar.low,
          high: bar.high,
          open: bar.open,
          close: bar.close,
        }];

      });

      // Uncomment this to test fake data
      // let dummyBars = [];
      // for(let i = 0; i < bars.length; i++) {
      //   if(bars.length - 1 === i) {
      //     dummyBars = [
      //       ...dummyBars, {
      //         time: bars[i].time,
      //         low: bars[i].low,
      //         high: bars[i].high,
      //         open: bars[i].open,
      //         close: bars[i].close,
      //       }
      //     ]
      //   } else {
      //     dummyBars = [
      //       ...dummyBars, {
      //         time: bars[i].time,
      //         low: 0,
      //         high: 0,
      //         open: 0,
      //         close: 0,
      //       }
      //     ]
      //   }
      // }

      console.log(`[getBars]: returned ${bars.length} bar(s)`);

      // This is to test markets with less than two candles.
      const newBars = bars.filter(
        bar =>
          new Date(bar.time).getFullYear() === new Date().getFullYear() &&
          new Date(bar.time).getDate() === new Date().getDate(),
      ).slice(0, 2)
      const meta = { noData: true, nextTime: undefined }
      if (newBars.length === 0) meta.noData = true

      onHistoryCallback(newBars, meta);
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
    console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
  },

  unsubscribeBars: (subscriberUID) => {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
  },
};