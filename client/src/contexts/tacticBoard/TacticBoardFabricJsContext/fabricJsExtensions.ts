import * as fabric from "fabric";

const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ["id", "additionalProperties"];
fabric.Object.prototype.toObject = function (additionalProperties: string[]) {
  return originalToObject.call(this, myAdditional.concat(additionalProperties));
};
