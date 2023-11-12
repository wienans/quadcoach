/**
 * Typescript doesn't support const myString = nullableVairable ?? throw new Exception, but ?? myFunction(),
 * so this is a helper function throwing the error
 * const myString = nullableVariable ?? throwExpression("nullableVariable is null or undefined")
 * Solution found on https://stackoverflow.com/a/65666402
 * @param errorMessage message to throw
 */
export function throwExpression(errorMessage: string): never {
  throw new Error(errorMessage);
}
