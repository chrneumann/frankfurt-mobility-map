import React from "react";
import styles from "./Spinner.module.css";
import classNames from "classnames";

type Props = {
  className: string;
};

export default function Spinner({ className }: Props) {
  return <div className={classNames(styles.root, className)}></div>;
}
