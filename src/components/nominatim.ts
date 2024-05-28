import { useEffect, useState } from "react";
import { LngLat } from "maplibre-gl";

/**
 * React hook to fetch the position's address using reverse geocoding.
 *
 * @param nominatimURL - URL to a Nominatim instance.
 * @param position - The coordinates of the position.
 * @returns The address or null if no position is given or the address can't be
 * retrieved.
 */
export function useReverseGeocoding(
  nominatimURL: string,
  position: LngLat | null,
): string | null {
  const [address, setAddress] = useState<string | null>(null);
  useEffect(() => {
    if (!position) {
      return;
    }
    const controller = new AbortController();
    (async () => {
      let newAddress = null;
      try {
        const response = await fetch(
          `${nominatimURL}/reverse?lat=${position.lat}&lon=${position.lng}&format=jsonv2&accept-language=de&layer=address`,
          { signal: controller.signal },
        );
        if (response.ok) {
          const result = await response.json();
          const address = result.address;
          newAddress = [
            address.road,
            address.house_number,
            address.suburb ? `(${address.suburb})` : null,
          ]
            .filter((x) => x)
            .join(" ");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setAddress(null);
      }
      setAddress(newAddress);
    })();
    return () => {
      controller.abort();
    };
  }, [position]);
  return address;
}
