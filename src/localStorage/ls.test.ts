import * as SUT from "./ls";

import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn((key: string, value: string) => {
      return new Promise((resolve) => {
        store[key] = value;
        resolve(null);
      });
    }),
    multiSet: jest.fn((kvPairs: string[][]) => {
      return new Promise((resolve) => {
        kvPairs.forEach(([key, value]) => (store[key] = value));
        resolve(null);
      });
    }),
    getItem: jest.fn((key: string) => {
      return new Promise((resolve) => {
        if (store[key]) resolve(store[key]);
        else resolve(null);
      });
    }),
    multiGet: jest.fn((keys: string[]) => {
      return new Promise((resolve) => {
        resolve(keys.map((key) => store[key] || null));
      });
    }),
    removeItem: jest.fn((key: string) => {
      return new Promise((resolve) => {
        delete store[key];
        resolve(null);
      });
    }),
    clear: jest.fn(() => {
      return new Promise((resolve) => {
        store = {};
        resolve(null);
      });
    }),
  };
});

describe("localStorage", () => {
  describe("readStorage", () => {
    it("should return the value of the given key from the local storage", async () => {
      expect(await SUT.readStorage("feature")).toEqual("value");
    });
  });
  describe("writeStorage", () => {});
});
