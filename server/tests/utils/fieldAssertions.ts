type FieldContainer = Record<string, unknown>;

function isFieldContainer(value: unknown): value is FieldContainer {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function expectExactFields(
  value: unknown,
  expectedFields: readonly string[],
): void {
  expect(isFieldContainer(value)).toBe(true);
  expect(Object.keys(value as FieldContainer).sort()).toEqual(
    [...expectedFields].sort(),
  );
}

function valuesAtPath(value: unknown, path: readonly string[]): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => valuesAtPath(item, path));
  }
  if (!isFieldContainer(value) || path.length === 0) {
    return [];
  }

  const [field, ...remainingPath] = path;
  if (!(field in value)) {
    return [];
  }
  if (remainingPath.length === 0) {
    return [value[field]];
  }
  return valuesAtPath(value[field], remainingPath);
}

export function expectForbiddenFields(
  value: unknown,
  forbiddenFieldPaths: readonly string[],
): void {
  for (const fieldPath of forbiddenFieldPaths) {
    expect(valuesAtPath(value, fieldPath.split("."))).toEqual([]);
  }
}
