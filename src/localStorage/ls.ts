import AsyncStorage from "@react-native-async-storage/async-storage";
import superJson from "superjson";
import z from "zod";

import LocalStorageSchema from "./schema";
import { safeAsync } from "../utils/async.utils";

const localStorageSchemaKeys = LocalStorageSchema.keyof();
type LocalStorage = z.infer<typeof LocalStorageSchema>;
type LsKey = keyof LocalStorage;
type LsValue<K extends LsKey> = LocalStorage[K];

// TODO: adjust to send back a tuple of [data, undefined] | [undefined, error]

export const readStorage = async <K extends LsKey>(
  key: K,
): Promise<LsValue<K> | null> => {
  const parseKey = localStorageSchemaKeys.safeParse(key);

  if (!parseKey.success) {
    console.error(`Key ${key} not found in LocalStorageSchema`, parseKey.error);
    return null;
  }

  const [jsonValue, error] = await safeAsync(AsyncStorage.getItem(key));

  if (error) {
    console.error(error);
    return null;
  }

  if (jsonValue === null) {
    return null;
  }

  const parsedJsonValue = superJson.parse<LsValue<K>>(jsonValue as string);
  const validatedValue =
    LocalStorageSchema.shape[key].safeParse(parsedJsonValue);

  if (!validatedValue.success) {
    console.error(validatedValue.error);
    return null;
  }
  return validatedValue.data;
};

export const writeStorage = async <K extends LsKey>(
  key: K,
  value: LsValue<K>,
): Promise<boolean> => {
  const parseKey = localStorageSchemaKeys.safeParse(key);
  if (!parseKey.success) {
    console.error(`Key ${key} not found in LocalStorageSchema`, parseKey.error);
    return false;
  }

  try {
    const validatedValue = LocalStorageSchema.shape[key].safeParse(value);
    if (!validatedValue.success) {
      console.error(validatedValue.error);
      return false;
    }

    const jsonValue = superJson.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);

    // TODO handle error in setting
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
};
