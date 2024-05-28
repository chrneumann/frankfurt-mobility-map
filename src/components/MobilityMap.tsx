import React, { useState } from "react";
import classNames from "classnames";

import { LngLat } from "maplibre-gl";
import { useReverseGeocoding } from "./nominatim";
import { useStops } from "./stops";

import StopInfo from "./StopInfo";
import Spinner from "./Spinner";

import "maplibre-gl/dist/maplibre-gl.css";
/* import type { LngLatLike } from "maplibre-gl"; */

/* import { MobilityMap as MapClass } from "./mobility-map.js"; */
import { useMobilityMap } from "./mobility-map.js";

import styles from "./MobilityMap.module.css";

type Props = {
  // URL of the MapLibre style.
  styleURL: string;
  // URL to a Nominatim instance.
  nominatimURL: string;
};

export type SelectedObject = {
  type: "stop";
  id: string;
};

export function MobilityMap({
  styleURL,
  nominatimURL,
}: Props): React.JSX.Element {
  console.log("render");

  const [position, setPosition] = useState<null | LngLat>(null);
  const [stops, stopsState] = useStops(position);
  const [selected, setSelected] = useState<null | SelectedObject>(null);
  const [containerRef] = useMobilityMap(
    styleURL,
    nominatimURL,
    stops,
    setPosition,
    setSelected,
  );
  const address = useReverseGeocoding(nominatimURL, position);

  const selectedStop =
    selected?.type === "stop"
      ? stops.filter((x) => selected.id === x.id)[0]
      : null;

  const sidebarOpen = position && selectedStop;

  const loading = stopsState === "loading";

  return (
    <aside className={styles.root}>
      <div className={styles.header}>
        <p>{address}&nbsp;</p>
      </div>
      <div
        className={classNames(styles.sidebar, {
          [styles["sidebar--open"]]: sidebarOpen,
        })}
      >
        <a
          href="#"
          className={styles.close}
          onClick={(e) => {
            e.preventDefault();
            setSelected(null);
          }}
        />
        {selectedStop && <StopInfo stop={selectedStop} />}
      </div>
      <div className={styles.map} ref={containerRef} />
      {loading && (
        <div className={styles.loading}>
          <Spinner className={styles.spinner} />
        </div>
      )}
    </aside>
  );
}
