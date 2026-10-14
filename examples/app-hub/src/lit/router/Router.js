// based on https://github.com/lit/lit/blob/c42ee1e96b8fd61f7256f61d715daef572e76e52/packages/labs/router/src/router.ts

import { waitForGlobals } from "../../utils/cross-origin-storage-utils.js";
import { defaultPath, tabs } from "../components/tabs/tabs.js";
const { litRouter } = await waitForGlobals();

const origin = location.origin || location.protocol + "//" + location.host;
const baseUrl = new URL(location);

const latestNavigationEntryStateSessionStorageKey =
  "latest-navigation-entry-state";

const latestNavigationEntryIndexSessionStorageKey =
  "latest-navigation-entry-index";
const latestNavigationEntryIndex = Number(
  sessionStorage.getItem(latestNavigationEntryIndexSessionStorageKey) ?? 0,
);
const initialNavigationEntryIndex = navigation.currentEntry.index;
const useCircularNavigationEntryStateBuffer = true;
const circularNavigationEntryStateBufferLength = 100; // iOS max
const latestCircularNavigationEntryStateBufferIndexSessionStorageKey =
  "latest-circular-navigation-entry-state-buffer-index";
const latestCircularNavigationEntryStateBufferIndex = Number(
  sessionStorage.getItem(
    latestCircularNavigationEntryStateBufferIndexSessionStorageKey,
  ) ?? 0,
);
let currentCircularNavigationEntryStateBufferIndex =
  latestCircularNavigationEntryStateBufferIndex;

// console.log({
//   initialNavigationEntryIndex,
//   latestNavigationEntryIndex,
//   currentCircularNavigationEntryStateBufferIndex,
// });
const circularNavigationEntryStateBufferSessionsStorageKeyPrefix =
  "circular-navigation-entry-state-buffer";

const saveLatestNavigationEntryToSessionStorage = true;
const saveNavigationEntryStatesToSessionStorage = true; // need to save to sessionStorage for safari iOS
const navigationEntryStateSessionsStorageKeyPrefix = "navigation-entry-state";
const entryKey = "index"; // safari iOS's key isn't consistent

/** @param {NavigationHistoryEntry | NavigationDestination} entry */
const getCircularNavigationEntryStateBufferIndex = (entry) => {
  const entryIndex = entry.index;
  if (entryIndex == -1) {
    return null;
  }
  const currentEntryIndex = navigation.currentEntry.index;
  if (entryIndex == currentEntryIndex) {
    // console.log({
    //   circularNavigationEntryStateBufferIndex:
    //     currentCircularNavigationEntryStateBufferIndex,
    // });
    return currentCircularNavigationEntryStateBufferIndex;
  }
  let circularNavigationEntryStateBufferIndex =
    currentCircularNavigationEntryStateBufferIndex +
    entryIndex -
    currentEntryIndex;
  while (circularNavigationEntryStateBufferIndex < 0) {
    circularNavigationEntryStateBufferIndex +=
      circularNavigationEntryStateBufferLength;
  }
  circularNavigationEntryStateBufferIndex %=
    circularNavigationEntryStateBufferLength;

  // console.log("getRouterCircularBufferIndex", {
  //   entry,
  //   circularNavigationEntryStateBufferLength,
  //   currentEntryIndex,
  //   entryIndex,
  //   currentCircularNavigationEntryStateBufferIndex,
  //   circularNavigationEntryStateBufferIndex,
  // });
  return circularNavigationEntryStateBufferIndex;
};

navigation.addEventListener("currententrychange", (event) => {
  const { from, navigationType } = event;
  const { currentEntry } = navigation;

  if (from.index == currentEntry.index) {
    return;
  }

  const indexOffset = currentEntry.index - from.index;
  currentCircularNavigationEntryStateBufferIndex += indexOffset;
  while (currentCircularNavigationEntryStateBufferIndex < 0) {
    currentCircularNavigationEntryStateBufferIndex +=
      circularNavigationEntryStateBufferLength;
  }
  currentCircularNavigationEntryStateBufferIndex %=
    circularNavigationEntryStateBufferLength;
  // console.log({
  //   indexOffset,
  //   currentCircularNavigationEntryStateBufferIndex,
  // });
});

const saveCurrentNavigationEntryStateToSessionStorage = () => {
  // console.log("saveCurrentNavigationEntryStateToSessionStorage");
  const { currentEntry } = navigation;
  const currentState = currentEntry.getState();
  const currentStateString = JSON.stringify(currentState);

  if (saveLatestNavigationEntryToSessionStorage) {
    // console.log(
    //   "saving currentState with latestRouterStateSessionStorageKey",
    //   currentState,
    // );

    sessionStorage.setItem(
      latestNavigationEntryStateSessionStorageKey,
      currentStateString,
    );
  }

  if (saveNavigationEntryStatesToSessionStorage) {
    if (useCircularNavigationEntryStateBuffer) {
      sessionStorage.setItem(
        latestNavigationEntryIndexSessionStorageKey,
        currentEntry.index,
      );
      sessionStorage.setItem(
        latestCircularNavigationEntryStateBufferIndexSessionStorageKey,
        currentCircularNavigationEntryStateBufferIndex,
      );

      const key = `${circularNavigationEntryStateBufferSessionsStorageKeyPrefix}-${getCircularNavigationEntryStateBufferIndex(currentEntry)}`;
      // console.log(`saving currentState with key ${key}`, currentState);
      sessionStorage.setItem(key, currentStateString);
    } else {
      const key = `${navigationEntryStateSessionsStorageKeyPrefix}-${currentEntry[entryKey]}`;
      // console.log(`saving currentState with key ${key}`, currentState);
      sessionStorage.setItem(key, currentStateString);
    }
  }
};

if (saveNavigationEntryStatesToSessionStorage) {
  const _getNavigationHistoryEntryState =
    NavigationHistoryEntry.prototype.getState;
  const _getNavigationDestinationState =
    NavigationDestination.prototype.getState;

  /** @param {NavigationHistoryEntry | NavigationDestination} entry */
  const getStateFromSessionStorage = (entry) => {
    // console.log("retrieving entry state from sessionStorage", entry);
    if (entry.index == -1) {
      // console.log(
      //   `not saving entry to sessionStorage - invalid index ${entry.index}`,
      //   entry,
      // );
      return;
    }
    const key = useCircularNavigationEntryStateBuffer
      ? `${circularNavigationEntryStateBufferSessionsStorageKeyPrefix}-${getCircularNavigationEntryStateBufferIndex(entry)}`
      : `${navigationEntryStateSessionsStorageKeyPrefix}-${entry[entryKey]}`;
    const stateString = sessionStorage.getItem(key);
    // console.log("sessionStorage", { key, stateString });
    if (stateString) {
      try {
        const state = JSON.parse(stateString);
        // console.log("sessionStorage state", state);
        return state;
      } catch (error) {
        console.error("failed to parse stateString", error);
      }
    }
  };

  NavigationHistoryEntry.prototype.getState = function () {
    // console.log("entry getState", this);
    const state = _getNavigationHistoryEntryState.call(this);
    if (state) {
      // console.log("existing state", state);
      return state;
    }
    return getStateFromSessionStorage(this);
  };
  NavigationDestination.prototype.getState = function () {
    // console.log("destination getState", this);
    const state = _getNavigationDestinationState.call(this);
    if (state) {
      // console.log("existing state", state);
      return state;
    }
    return getStateFromSessionStorage(this);
  };
}

export class Router extends litRouter.Routes {
  /** @param {{defaultPath: string, beforeGoto: (pathname: string) => Promise<void>, afterGoto: (pathname: string) => Promise<void> }} options */
  constructor(host, routes, options) {
    super(host, routes, options);
    this._defaultRoute = options?.defaultPath ?? "/";
    this._host = host;
    // console.log("Router", this, options);

    this._beforeGoto = options?.beforeGoto;
    this._afterGoto = options?.afterGoto;
  }
  hostConnected() {
    super.hostConnected();

    this._abortController = new AbortController();

    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    navigation.addEventListener("navigate", this._onNavigate, options);

    // Kick off routed rendering by going to the current URL
    const entries = navigation.entries();
    if (entries.length == 1) {
      const state = entries[0].getState();
      if (state) {
        // console.log("loading state", state);
        this.goto(state.route);
      } else {
        // console.log("setting initial state");
        const state = { route: this._defaultRoute };
        navigation.updateCurrentEntry({ state });
        this.goto(state.route);
      }
    } else {
      const currentEntryIndex = navigation.currentEntry.index;
      const currentEntryState = navigation.currentEntry.getState();
      // console.log({ currentEntryIndex, currentEntryState });
      // if you pass the navigation.entries() max, it just stores the first n entries instead of the last n entries
      if (false && currentEntryState) {
        // console.log("loading currentEntryState", currentEntryState);
        this.goto(currentEntryState.route);
      } else {
        try {
          const stateString = sessionStorage.getItem(
            latestNavigationEntryStateSessionStorageKey,
          );
          const state = JSON.parse(stateString);
          // console.log("session state", state);
          navigation.updateCurrentEntry({ state });
          this.goto(state.route);
        } catch (error) {
          // console.log("no sessionStorage - traversing to latest");
          for (let i = entries.length; i >= 0; i--) {
            entries;
          }
          entries.reverse().some((entry) => {
            const state = entry.getState();
            if (state) {
              // console.log("using prior state");
              navigation.updateCurrentEntry({ state });
              this.goto(state.route);
              return true;
            }
          });
          console.log("failed to find valid entry - going to root");
          const state = { route: this._defaultRoute };
          navigation.updateCurrentEntry({ state });
          this.goto(state.route);
        }
      }
    }
  }

  hostDisconnected() {
    super.hostDisconnected();

    this._abortController.abort();
    this._abortController = undefined;
  }

  async goto(pathname) {
    const activeTab = pathname.split("/")?.filter(Boolean)?.[0] ?? defaultPath;

    await this._beforeGoto?.(pathname, activeTab);
    await super.goto(pathname);
    await this._afterGoto?.(pathname, activeTab);

    const { currentEntry } = navigation;
    const currentState = currentEntry.getState();
    if (!currentState) {
      // console.log("currentState not defined - updating");
      const state = { route: this._defaultRoute };
      navigation.updateCurrentEntry({ state });
    }

    saveCurrentNavigationEntryStateToSessionStorage();
  }

  /** @param {NavigationEventMap["navigate"]} event */
  _onNavigate = (event) => {
    const { destination, navigationType, info, canIntercept } = event;
    const { currentEntry } = navigation;
    // console.log("_onNavigate", destination, {
    //   navigationType,
    //   info,
    //   canIntercept,
    // });

    if (navigationType == "reload") {
      return;
    }
    if (!canIntercept) {
      return;
    }

    const url = new URL(destination.url);

    // Ignore cross-origin navigations
    if (url.origin !== origin) {
      return;
    }

    // Let browser handle downloads, external targets, etc.
    if (event.downloadRequest || event.hashChange) {
      return;
    }

    const destinationState = destination.getState();
    const currentState = currentEntry.getState();
    // console.log({ destinationState, currentState });

    // if (!destinationState) {
    //   console.warn("undefined destinationState - not traversing");
    //   try {
    //     e.preventDefault();
    //   } catch (error) {}
    //   navigation.updateCurrentEntry({
    //     state: { ...currentState },
    //   });
    //   return;
    // }

    if (navigationType == "traverse" && !destinationState) {
      console.warn("no destinationState for traversal");
      try {
        event.preventDefault();
      } catch (error) {}
      return;
    }

    const isBase = url.pathname == baseUrl.pathname;
    const route = destinationState?.route ?? url.pathname;

    // console.log({
    //   urlPathname: url.pathname,
    //   baseUrlPathname: baseUrl.pathname,
    //   isBase,
    //   route,
    // });

    if (currentState.route == route) {
      console.log(`redundant route ${route} - skipping`);
      try {
        event.preventDefault();
      } catch (error) {}
      const state = {
        ...currentState,
        repeat: (currentState?.repeat ?? 0) + 1,
      };
      navigation.updateCurrentEntry({
        state,
      });
      return;
    }

    if (isBase) {
      // console.log("about to intercept navigation");
      event.intercept({
        handler: async () => {
          // console.log("routeHandler", { route }, tabs);

          const activeTab =
            route.split("/")?.filter(Boolean)?.[0] ?? defaultPath;
          const tabIndex = tabs.indexOf(activeTab);
          // console.log({ route, activeTab, tabIndex });

          const previousRoute = currentState.route;
          const previousTab = previousRoute.split("/")?.filter(Boolean)?.[0];
          const previousTabIndex = tabs.indexOf(previousTab);
          // console.log({ previousRoute, previousTab, previousTabIndex });

          if (!document.startViewTransition || this._host.skipViewTransitions) {
            await this.goto(route);
            return;
          }

          const types = [];
          if (tabIndex != previousTabIndex) {
            // console.log(
            //   `moving from "${previousTab}" tab to "${activeTab}" tab`,
            // );
            if (info?.types) {
              types.push(...info.types);
            } else {
              types.push(
                tabIndex > previousTabIndex ? "next-tab" : "previous-tab",
              );
            }
          } else {
            // FILL - moving between paths of the same route
          }
          // console.log("view transition types", types);

          await document.startViewTransition({
            update: async () => {
              await this.goto(route);
            },
            types,
          }).finished;
        },
      });
    } else {
      try {
        event.preventDefault();
      } catch (error) {}
      const state = { route };
      try {
        navigation.navigate("./", { state, history: "push", info });
      } catch (error) {}
    }
  };
}
