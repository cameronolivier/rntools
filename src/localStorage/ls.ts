import AsyncStorage from "@react-native-async-storage/async-storage";
import superJson from "superjson";
import z, { ZodSchema } from "zod";

import LocalStorageSchema from "./schema";
import { safeAsync } from "../utils/async.utils";

const localStorageSchemaKeys = LocalStorageSchema.keyof();
type LocalStorage = z.infer<typeof LocalStorageSchema>;
type LsKey = keyof LocalStorage;
type LsValue<K extends LsKey> = LocalStorage[K];

type LSErrorOrigin = "ls" | "asyncStorage" | "zod";

type LSError = {
  origin: LSErrorOrigin;
  message: string;
  data: unknown;
};

type LSReadReturnType<K extends LsKey> =
  | [LsValue<K> | null, undefined]
  | [undefined, LSError];

type LSWriteReturnType = [true, undefined] | [false, LSError];

const makeError = (
  message: string,
  data?: unknown,
  origin: LSErrorOrigin = "ls",
): LSError => ({
  origin,
  message,
  data,
});

const returnError = (error: LSError): [undefined, LSError] => [
  undefined,
  error,
];

export const parseSchemaKey =
  (schema: ZodSchema) =>
  (key: unknown): [true, undefined] | [false, LSError] => {
    const parseKey = schema.safeParse(key);
    if (!parseKey.success) {
      return [
        false,
        makeError(`Key "${key}" not found in schema`, parseKey.error, "zod"),
      ];
    }
    return [true, undefined];
  };

const parseLsSchemaKey = parseSchemaKey(LocalStorageSchema);

export const readStorage = async <K extends LsKey>(
  key: K,
): Promise<LSReadReturnType<K>> => {
  const [keyExists, keyError] = parseLsSchemaKey(key);
  if (!keyExists) {
    return [undefined, keyError];
  }

  const [jsonValue, error] = await safeAsync(AsyncStorage.getItem(key));

  if (error) {
    return returnError(
      makeError(
        `Something went wrong retrieving the item from AsyncStorage`,
        error,
        "asyncStorage",
      ),
    );
  }

  if (jsonValue === null) {
    return [null, undefined];
  }

  const parsedJsonValue = superJson.parse<LsValue<K>>(jsonValue as string);
  const validatedValue =
    LocalStorageSchema.shape[key].safeParse(parsedJsonValue);

  if (!validatedValue.success) {
    return returnError(
      makeError(
        `The returned value is not a valid value for the provided ${key}`,
        validatedValue.error,
        "zod",
      ),
    );
  }
  return [validatedValue.data, undefined];
};

export const writeStorage = async <K extends LsKey>(
  key: K,
  value: LsValue<K>,
): Promise<LSWriteReturnType> => {
  const [keyExists, keyError] = parseLsSchemaKey(key);

  if (!keyExists) {
    return [false, keyError];
  }

  const validatedValue = LocalStorageSchema.shape[key].safeParse(value);
  if (!validatedValue.success) {
    return [
      false,
      makeError(
        `The value ${value} is not a valid value for the provided ${key}`,
        validatedValue.error,
        "zod",
      ),
    ];
  }

  const jsonValue = superJson.stringify(value);
  const [_, error] = await safeAsync(AsyncStorage.setItem(key, jsonValue));

  if (error) {
    return [
      false,
      makeError(
        `Something went wrong retrieving the item from AsyncStorage`,
        error,
        "asyncStorage",
      ),
    ];
  }

  return [true, undefined];
};
