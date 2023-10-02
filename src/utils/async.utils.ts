export const safeAsync = async <T = unknown, E = unknown>(
  promise: Promise<unknown>,
): Promise<[T, undefined] | [undefined, E]> => {
  try {
    const response = await promise;
    return [response as T, undefined];
  } catch (e) {
    return [undefined, e as E];
  }
};
