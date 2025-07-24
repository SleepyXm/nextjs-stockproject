import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries } from 'lightweight-charts';
import { LineChart, LineChartColors } from '../types/charts';


export const CandleStickChart: React.FC<{
  data: any[];
  colors?: any;
}> = ({ data, colors = {} }) => {
  const {
    backgroundColor = 'transparent',
    textColor = 'black',
    upColor = '#1fb369ff',
    downColor = '#ad4b44ff',
    borderUpColor = '#1fb369ff',
    borderDownColor = '#ad4b44ff',
    wickUpColor = '#1fb369ff',
    wickDownColor = '#ad4b44ff',
  } = colors;

  const chartContainerRef2 = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef2.current) return;

    const chart = createChart(chartContainerRef2.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef2.current.clientWidth,
      height: chartContainerRef2.current.clientHeight,
      timeScale: {
        rightOffset: 30,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor,
      borderDownColor,
      wickUpColor,
      wickDownColor,
    });

    series.setData(data);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef2.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef2.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef2} style={{ width: 1500, height: 900 }} />;
};








export const Linechart: React.FC<{
  data: LineChart[];
  colors?: LineChartColors;
}> = ({ data, colors = {} }) => {
  const {
    backgroundColor = 'transparent',
    textColor = 'black',
    lineColor = '#2962FF',
    areaTopColor = '#2962FF',
    areaBottomColor = 'rgba(41, 98, 255, 0.28)',
  } = colors;

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        rightOffset: 30,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    series.setData(data);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: 1500, height: 900 }} />;
};



export const LinechartIntraday: React.FC<{
  data: LineChart[];
  colors?: LineChartColors;
}> = ({ data, colors = {} }) => {
  const {
    backgroundColor = 'transparent',
    textColor = 'black',
    lineColor = '#4deb82ff',
    areaTopColor = '#29ff70ff',
    areaBottomColor = 'rgba(15, 92, 49, 0.28)',
  } = colors;

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        rightOffset: 30,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    series.setData(data);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: 600, height: 200 }} />;
};