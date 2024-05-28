import React from "react";
import type { Line, Product, Stop } from "./stops";
import ProductIcon from "./ProductIcon";
import styles from "./StopInfo.module.css";

type Props = {
  stop: Stop;
};

function cleanName(name: string): string {
  return name
    .replace("Bus ", "")
    .replace("S ", "")
    .replace("U ", "")
    .replace("STR ", "");
}

export default function StopInfo({ stop }: Props) {
  const linesByProduct = new Map<Product, Line[]>();
  for (const line of stop.lines) {
    if (linesByProduct.get(line.product) === undefined) {
      linesByProduct.set(line.product, []);
    }
    const lines = linesByProduct.get(line.product);
    if (lines === undefined) {
      throw new Error("Assertion failed");
    }
    lines.push(line);
  }
  return (
    <aside className={styles.root}>
      <h1>{stop.name}</h1>
      <ul>
        {Array.from(linesByProduct).map(([productId, lines]) => (
          <li key={productId}>
            <ProductIcon product={productId} />
            <ul>
              {lines.map((line) => (
                <li key={line.name}>{cleanName(line.name)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
