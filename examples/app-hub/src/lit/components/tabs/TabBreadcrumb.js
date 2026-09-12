import { waitForGlobals } from "../../../utils/cross-origin-storage-utils.js";

const { lit, litRepeat } = await waitForGlobals();

const { LitElement, html } = lit;
const { repeat } = litRepeat;

import { createNavigationStateContextConsumer } from "../../contexts/navigationStateContext.js";
import { capitalize } from "../../../utils/string-utils.js";

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/breadcrumb/breadcrumb.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/breadcrumb-item/breadcrumb-item.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/divider/divider.js";
import { createViewportOrientationContextConsumer } from "../../contexts/viewportOrientationContext.js";
import { tabIcons } from "./tabs.js";

class TabBreadcrumb extends LitElement {
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this._navigationStateConsumer = createNavigationStateContextConsumer(
      this,
      true,
      () => this._onNavigationStateUpdate(),
    );
    this._viewportOrientationConsumer =
      createViewportOrientationContextConsumer(this, true);
  }

  /** @type {import("../../contexts/viewportOrientationContext.js").ViewportOrientation} */
  get viewportOrientation() {
    return this._viewportOrientationConsumer.value.state.viewportOrientation;
  }

  /** @type {import("../../contexts/navigationStateContext.js").NavigationContextState} */
  get navigationState() {
    return this._navigationStateConsumer.value.state;
  }
  _onNavigationStateUpdate() {
    // console.log("_onNavigationStateUpdate");
    this.routeSegments = this.navigationState.route.split("/").filter(Boolean);
    this.formattedRouteSegments = this.routeSegments.map((string) =>
      capitalize(string),
    );
    this.tab = this.routeSegments[0];
  }

  render() {
    // console.log("routeSegments", this.routeSegments);
    // console.log("tab", this.tab);

    let icons = tabIcons[this.tab];
    if (this.viewportOrientation in icons) {
      icons = icons[this.viewportOrientation];
    }
    const { name, family } = icons;

    return html`
      <div class="wa-stack wa-gap-2xs">
        <div>
          <wa-breadcrumb>
            ${repeat(
              this.formattedRouteSegments,
              (segment) => segment,
              (segment, index) => {
                if (index == 0) {
                  return html`<wa-breadcrumb-item>
                    <wa-icon
                      slot="start"
                      family=${family}
                      name=${name}
                    ></wa-icon>
                    ${segment}
                  </wa-breadcrumb-item>`;
                } else {
                  return html`<wa-breadcrumb-item>
                    ${segment}
                  </wa-breadcrumb-item>`;
                }
              },
            )}
          </wa-breadcrumb>
        </div>
        <wa-divider
          style="--color: var(--bw-breadcrumb-divider-color);"
        ></wa-divider>
      </div>
    `;
  }
}

customElements.define("bw-tab-breadcrumb", TabBreadcrumb);
