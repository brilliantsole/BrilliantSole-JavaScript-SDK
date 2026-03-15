const DB_NAME = "appDB";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let dbPromise;

/** @returns {Promise<IDBDatabase>} */
const openDB = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

const idbGet = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const idbSet = async (key, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const idbDelete = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

/**
 * @param {string} key
 * @param {() => any} getValue
 * @param {(any?) => void} onValue
 * @param {() => boolean} didValueUpdate
 */
const setupIndexedDB = (key, getValue, onValue, didValueUpdate) => {
  const load = async () => {
    try {
      const value = await idbGet(key);
      if (value !== undefined) {
        onValue(value);
      }
    } catch (error) {
      console.error(`failed to load ${key}`, error);
    }
  };

  let didUploadValue = false;

  const save = async () => {
    if (!didValueUpdate() && !didUploadValue) {
      return;
    }
    try {
      await idbSet(key, getValue());
    } catch (error) {
      console.error(`failed to save ${key}`, error);
    }
  };

  window.addEventListener("beforeunload", (event) => {
    try {
      save();
    } catch (error) {
      console.error(error);
      event.preventDefault();
    }
  });

  load();

  const clear = async () => {
    await idbDelete(key);
    onValue();
  };

  const download = () => {
    const value = getValue();
    const json = JSON.stringify(value, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pressure";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** @param {File} file */
  const upload = async (file) => {
    try {
      const text = await file.text();
      const _value = JSON.parse(text);
      const value = getValue();

      if (Array.isArray(value) && Array.isArray(_value)) {
        onValue([...value, ..._value]);
      } else {
        onValue(_value);
      }

      didUploadValue = true;
    } catch (error) {
      console.error("failed to upload file", error);
    }
  };

  return { clear, download, upload };
};

export { setupIndexedDB };
