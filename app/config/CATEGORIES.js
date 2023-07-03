import PURCHASEINFO from "./PURCHASEINFO";
import OPERATIONS from "./OPERATIONS";
import POOPERATIONS from "./POOPERATIONS";
import SALESINFO from "./SALESINFO";

export default [
  {
    id: 1,
    title: "Sales Orders",
    operations: [...OPERATIONS],
    info: [...SALESINFO],
    offline: true
  },
  {
    id: 2,
    title: "Purchase Orders",
    operations: [...POOPERATIONS],
    info: [...PURCHASEINFO],
    offline: false
  }
];
