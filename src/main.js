// Datafeed implementation, will be added later
import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
  symbol: 'Bittrex:BTC/USD', // default symbol
  interval: '1D', // default interval
  fullscreen: true, // displays the chart in the fullscreen mode
  container: 'tv_chart_container',
  datafeed: Datafeed,
  library_path: '../charting_library_clonned_data/charting_library/',
});


window.tvWidget.onChartReady(() => {
  console.log('Chart ready');

  let crosshairValue;

  const crosshairMovedHandler = (params) => {
    crosshairValue = params;
  };

  window.tvWidget.activeChart().crossHairMoved().subscribe(null, crosshairMovedHandler);

  window.tvWidget.subscribe('mouse_down', () => {
    const mouseUpHandler = () => {
      console.log(crosshairValue);
      window.tvWidget.unsubscribe('mouse_up', mouseUpHandler);
    };

    window.tvWidget.subscribe('mouse_up', mouseUpHandler);
  });

  window.tvWidget
    .activeChart()
    .crossHairMoved()
    .subscribe(null, ({ price }) => {
      /*
       * If the chart is set, but it doesn't have a trade yet (no data) it can break the app, validate that "price"
       * is a number before changing that value. This parameter (price) comes directly from the TVChart library and
       * it can either be a number or a NaN if something went wrong (current version: 1.15).
       * Reference: https://github.com/tradingview/charting_library/wiki/Chart-Methods#crosshairmovedcallback
       */
      //console.log(price)
    })
})