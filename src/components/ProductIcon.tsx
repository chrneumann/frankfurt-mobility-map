import React from "react";
import classNames from "classnames";

import styles from "./ProductIcon.module.css";
import type { Product } from "./stops";

type Props = {
  product: Product;
  circled?: boolean;
};

export default function ProductIcon({ product, circled }: Props) {
  const iconProduct = [
    "national",
    "nationalExpress",
    "regional",
    "regionalExpress",
  ].includes(product)
    ? "train"
    : product;
  return (
    <div
      className={classNames(styles.icon, styles[iconProduct], {
        [styles.circled]: !!circled,
      })}
    ></div>
  );
}
