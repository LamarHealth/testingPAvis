class LocalStorage {
  store: Storage | typeof chrome.storage;
  isChrome: boolean;
  constructor() {
    this.store =
      process.env.REACT_APP_LOCAL === "local" ? localStorage : chrome.storage;
    this.isChrome = process.env.REACT_APP_LOCAL === "build";
  }

  async get(key: string) {
    if (this.isChrome) {
      let result = "";
      await chrome.storage.local.get(key, (res: any) => {
        console.log(res);
        result = res.key;
      });
      console.log("result", result);
      return result;
    } else return localStorage.getItem(key);
  }
  set(key: string, value: string) {
    return this.isChrome
      ? chrome.storage.local.set({ key: value }, () => {
          console.log(`value is set to ${value}`);
        })
      : localStorage.setItem(key, value);
  }
}

export const storage = new LocalStorage();
