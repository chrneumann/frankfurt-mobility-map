import { createElement, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Map as LibreMap, Marker, LngLat } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import ProductIcon from "./ProductIcon";
import { Protocol } from "pmtiles";
import { type Product, type Stop } from "./stops";
import type { SelectedObject } from "./MobilityMap";

export class MobilityMap {
  private map: LibreMap;
  private positionMarker: Marker;
  private stopMarker: Marker[];
  private onSelectionChange: (object: SelectedObject | null) => void;
  private lastPosition: [number, number];

  /**
   * Initializes the map.
   *
   * @param container - The HTML element to attach to.
   * @param onLoad - Callback which is called when the map is loaded.
   * @param onPositionChange - Callback which is called when the position is changed.
   * @param onSelectionChange - Callback which is called when an object is selected.
   */
  constructor(
    styleURL: string,
    // center: LngLatLike,
    container: HTMLElement,
    onLoad: (map: MobilityMap) => void,
    onPositionChange: (position: LngLat | null) => void,
    onSelectionChange: (object: SelectedObject | null) => void,
  ) {
    console.log("construct");
    const protocol = new Protocol();
    this.positionMarker = new Marker({ color: "#500075" });
    this.onSelectionChange = onSelectionChange;
    this.stopMarker = [];
    this.map = new LibreMap({
      container,
      style: styleURL,
      center: [8.683737, 50.115161],
      zoom: 13,
      cooperativeGestures: true,
      attributionControl: {
        customAttribution:
          '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap Mitwirkende</a> <a href = "https://www.maptiler.com/copyright/" target="_blank" >&copy; MapTiler</a>',
      },
    });
    this.lastPosition = [0, 0];
    maplibregl.addProtocol("pmtiles", protocol.tile);

    this.map.on("click", (e) => {
      this.positionMarker.remove();
      this.positionMarker = new Marker({ color: "#500075" })
        // .setLngLat(this.map.getCenter())
        .setLngLat(e.lngLat)
        .addTo(this.map);
      // const center = this.map.getCenter();
      // if (center.lng !== this.lastPosition[0] && center.lat !== this.lastPosition[1]) {
      onSelectionChange(null);
      onPositionChange(e.lngLat);
      //   this.lastPosition = [center.lng, center.lat];
      // }
      //   this.map.flyTo({
      //   center: e.lngLat,
      // });
    });

    this.map.on("movestart", () => {
      this.map.getCanvas().style.cursor = "grab";
      // onSelectionChange(null);
      // onPositionChange(null);
      // this.positionMarker.remove();
      // this.positionMarker = new Marker({ color: "#EAD9F2" })
      //   .setLngLat(this.map.getCenter())
      //   .addTo(this.map);
    });
    // this.map.on("move", () => {
    //   this.positionMarker.setLngLat(this.map.getCenter()).addTo(this.map);
    // });
    this.map.on("moveend", () => {
      this.map.getCanvas().style.cursor = "crosshair";
    });
    this.map.on("load", () => {
      this.map.getCanvas().style.cursor = "crosshair";
      this.map.addControl(new maplibregl.NavigationControl());
      this.positionMarker.setLngLat(this.map.getCenter()).addTo(this.map);
      const center = this.map.getCenter();
      this.lastPosition = [center.lng, center.lat];
      onPositionChange(this.map.getCenter());
      onLoad(this);
    });
  }

  /**
   * Sets and displays stops on map.
   **/
  setStops(stops: Stop[]) {
    this.stopMarker.forEach((m) => m.remove());
    this.stopMarker = [];
    for (const stop of stops) {
      let product: null | Product = null;
      if (stop.products.bus) {
        product = "bus";
      }
      if (stop.products.tram) {
        product = "tram";
      }
      if (stop.products.subway) {
        product = "subway";
      }
      if (stop.products.suburban) {
        product = "suburban";
      }
      for (const id of [
        "bus",
        "tram",
        "subway",
        "suburban",
        "national",
        "nationalExpress",
        "regional",
        "regionalExpress",
      ] as Product[]) {
        if (stop.products[id]) {
          product = id;
        }
      }
      if (!product) {
        continue;
      }
      const icon = document.createElement("a");
      icon.href = "#";
      icon.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onSelectionChange({
          type: "stop",
          id: stop.id,
        });
      };
      const root = createRoot(icon);
      root.render(createElement(ProductIcon, { product, circled: true }));
      this.stopMarker.push(
        new Marker({
          element: icon,
        }).setLngLat([stop.location.longitude, stop.location.latitude]),
      );
    }
    this.stopMarker.forEach((m) => m.addTo(this.map));
  }

  /**
   * Cleans up the map.
   *
   * Removes the PMTiles protocol from MapLibre GL.
   */
  destruct() {
    maplibregl.removeProtocol("pmtiles");
  }
}

/**
 * React hook to initialize and update the mobility map.
 *
 * @param container - The map container.
 * @param nominatimURL - URL to a Nominatim instance.
 */
export function useMobilityMap(
  styleURL: string,
  nominatimURL: string,
  stops: Stop[],
  setPosition: (position: LngLat | null) => void,
  setSelected: (object: SelectedObject | null) => void,
): [React.RefObject<HTMLDivElement>] {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<null | MobilityMap>(null);

  console.log("stops: ", stops);

  // Initialize the map.
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    console.log("construct map");
    const theMap = new MobilityMap(
      styleURL,
      containerRef.current,
      setMap,
      setPosition,
      setSelected,
    );
    return () => {
      console.log("destruct map");
      theMap.destruct();
    };
  }, [containerRef]);

  // Update map when stops change.
  useEffect(() => {
    if (map) {
      map.setStops(stops);
    }
  }, [stops, map]);

  return [containerRef];
}
