import { isArray } from "lodash";

/**
 * Regex for identify datestring
 */
const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d*)?Z?$/;

interface StringKeyValueType {
  [key: string]: unknown;
}

export function deserializeDatesInObject<Output>(body: Output): Output {
  if (body === null || body === undefined || typeof body !== "object") {
    return body;
  }

  if (isArray(body)) {
    const adjustedBodyArray = [...body];
    const adjustedBodyArrayLength = adjustedBodyArray.length;

    for (
      let adjustedBodyArrayIterator = 0;
      adjustedBodyArrayIterator < adjustedBodyArrayLength;
      adjustedBodyArrayIterator += 1
    ) {
      adjustedBodyArray[adjustedBodyArrayIterator] = deserializeDatesInObject(
        adjustedBodyArray[adjustedBodyArrayIterator],
      );
    }

    return adjustedBodyArray as unknown as Output;
  }

  const adjustedBody = { ...body } as unknown as StringKeyValueType;

  const keys = Object.keys(adjustedBody);
  const keysLength = keys.length;

  for (let keysIterator = 0; keysIterator < keysLength; keysIterator += 1) {
    const key = keys[keysIterator];
    const value = adjustedBody[key];

    if (typeof value === "string" && dateFormat.test(value)) {
      adjustedBody[key] = new Date(value);
    } else if (typeof value === "object") {
      adjustedBody[key] = deserializeDatesInObject(value);
    }
  }
  return adjustedBody as unknown as Output;
}
