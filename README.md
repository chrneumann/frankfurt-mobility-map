# Frankfurt Mobility Map

Map showing public transport stations near some location in Frankfurt. Used at
example at
https://codingmobility.net/mobilitaetsdaten

The project consists of the `MobilityMap` React component to display the map.

This is a proof of concept and reference/learning material. It's not intended
for use in production.

## Example usage

### React component to show map

Build the component library:

> npm install
> npm run build:js

If using TypeScript:

> npm run build:types

Use it as component:

```tsx
import { MobilityMap } from "frankfurt-mobility-map";
import "frankfurt-mobility-map/styles.css";
export default function Page() {
    return <MobilityMap styleURL="/styles.json" nominatimURL={yourNominatimURL} />;
}
```
