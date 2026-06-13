import { useMemo, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

import { Sparkline } from "@/components/ui/Sparkline";

type Props = {
  /** Price series, oldest → newest (index values or dollars). */
  data: number[];
  height?: number;
};

// Pinned to the installed package version (see package.json).
const LWC_CDN =
  "https://unpkg.com/lightweight-charts@5.2.0/dist/lightweight-charts.standalone.production.js";

/**
 * Area price chart rendered with TradingView Lightweight Charts inside a
 * WebView. Daylight palette. Falls back to the SVG Sparkline if the WebView
 * or CDN script fails (e.g. offline), so the screen never breaks.
 */
export function PriceChart({ data, height = 180 }: Props) {
  const [failed, setFailed] = useState(false);

  const html = useMemo(() => buildHtml(data, height), [data, height]);

  if (data.length < 2) return null;
  if (failed) {
    return (
      <View style={{ height }} className="justify-center">
        <Sparkline data={data} color="#0E7A66" height={Math.min(height, 64)} fill />
      </View>
    );
  }

  return (
    <View style={{ height, borderRadius: 12, overflow: "hidden" }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled={false}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        onMessage={(e) => {
          if (e.nativeEvent.data === "lwc-failed") setFailed(true);
        }}
      />
    </View>
  );
}

function buildHtml(data: number[], height: number): string {
  // Synthesize weekly dates ending today — the curated series are 1y index
  // paths without timestamps. Live (Polygon-backed) charts can pass dollars.
  const points = data.map((value, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (data.length - 1 - i) * 7);
    return { time: d.toISOString().slice(0, 10), value: Math.round(value * 100) / 100 };
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  html, body { margin: 0; padding: 0; background: transparent; height: 100%; }
  #chart { position: absolute; inset: 0; }
</style>
</head>
<body>
<div id="chart"></div>
<script src="${LWC_CDN}" onerror="window.ReactNativeWebView && window.ReactNativeWebView.postMessage('lwc-failed')"></script>
<script>
  try {
    var chart = LightweightCharts.createChart(document.getElementById('chart'), {
      width: document.body.clientWidth,
      height: ${height},
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#8C988F',
        fontSize: 10,
        attributionLogo: false
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#EAEDE8' }
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: { color: '#8C988F', width: 1, style: 2 },
        horzLine: { visible: false }
      }
    });
    var series = chart.addSeries(LightweightCharts.AreaSeries, {
      lineColor: '#0E7A66',
      lineWidth: 2,
      topColor: 'rgba(14, 122, 102, 0.22)',
      bottomColor: 'rgba(14, 122, 102, 0.02)',
      priceLineVisible: false,
      lastValueVisible: true
    });
    series.setData(${JSON.stringify(points)});
    chart.timeScale().fitContent();
  } catch (e) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('lwc-failed');
  }
</script>
</body>
</html>`;
}
