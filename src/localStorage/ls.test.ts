import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SUT from "./ls";

jest.mock("@react-native-async-storage/async-storage");

describe("localStorage", () => {
  describe("readStorage", () => {
    it("should return the value of the given the key from the local storage", async () => {
      await AsyncStorage.setItem("feature", JSON.stringify("value"));

      const result = await SUT.readStorage("feature");
      expect(result).toBe("value");
    });
  });
  describe("writeStorage", () => {});
});
