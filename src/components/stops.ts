import { useEffect, useState } from "react";
import { LngLat } from "maplibre-gl";

export type Line = {
  name: string;
  product: Product;
};

/**
 * A stop as returned by the transport API.
 */
export type Stop = {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  products: {
    bus: boolean;
    ferry: boolean;
    national: boolean;
    nationalExpress: boolean;
    regional: boolean;
    regionalExpress: boolean;
    suburban: boolean;
    subway: boolean;
    taxi: boolean;
    tram: boolean;
  };
  lines: Line[];
  type: string;
};

export type Product = keyof Stop["products"];

type RawStop = Stop & {
  station?: Stop;
};

type LoadingState = "init" | "loading" | "loaded";

/**
 * Processes stops as returned by the "nearby" query.
 */
function parseStops(data: Stop[]): Stop[] {
  const stationIDs = [];
  for (const stop of data) {
    stationIDs.push(stop.id as string);
  }
  const stops = [];
  for (const stop of data as RawStop[]) {
    if (stop.station && stationIDs.includes(stop.station.id)) {
      // If this stop has a "master" station that is included in the response,
      // ignore this stop.
      continue;
    }
    stop.name = stop.name
      .replace(", Frankfurt a.M.", "")
      .replace("Frankfurt(M)", "");
    stops.push(stop);
  }
  return stops;
}

/**
 * React hook to fetch the position's nearby stops.
 *
 * @param position - The coordinates of the position.
 * @returns List of retreived stops and the loading state.
 */
export function useStops(position: LngLat | null): [Stop[], LoadingState] {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("init");
  useEffect(() => {
    if (!position) {
      return;
    }
    setStops([]);
    setLoadingState("loading");
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(
          `https://v6.db.transport.rest/locations/nearby?latitude=${position.lat}&longitude=${position.lng}&results=30&distance=1000&linesOfStops=true&language=de`,
          {
            signal: controller.signal,
          },
        );
        if (response.ok) {
          const result = await response.json();
          setStops(parseStops(result));
        }
        setLoadingState("loaded");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
      return () => {
        controller.abort();
      };
    })();
  }, [position]);
  return [stops, loadingState];
}
