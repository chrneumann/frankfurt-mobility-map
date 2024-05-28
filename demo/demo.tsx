import React from "react";
import { createRoot } from 'react-dom/client';
import { MobilityMap } from "../src/components";

// Live reloading; only use in development
new EventSource('/esbuild').addEventListener('change', () => location.reload())

document.body.innerHTML = '<div id="app" style="height: 500px"></div>';
const root = createRoot(document.getElementById('app')!);
root.render(<MobilityMap styleURL="/styles.json" nominatimURL="https://nominatim.codingmobility.net/" />);
