let store = {};

const mockAsyncStorage = {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve) => {
      store[key] = value;
      resolve(null);
    });
  }),
  getItem: jest.fn((key) => {
    return new Promise((resolve) => {
      if (store[key]) resolve(store[key]);
      else resolve(null);
    });
  }),
  removeItem: jest.fn((key) => {
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

export default mockAsyncStorage;
