import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import {
  createThemeContextConsumer,
  getTheme,
} from "../../../contexts/themeContext.js";

const { lit } = await waitForGlobals();

const { LitElement, html, css } = lit;

import "../HeaderButton.js";

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/dropdown/dropdown.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/dropdown-item/dropdown-item.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/divider/divider.js";

class MenuButtonTheme extends LitElement {
  static properties = {
    dropdown: { type: Boolean, reflect: true },
  };

  static styles = css`
    [checked] {
      font-weight: var(--wa-font-weight-bold);
    }
  `;

  _themeConsumer = createThemeContextConsumer(this, true, (themeState) => {
    this.theme = getTheme(themeState);
  });

  /** @type {import("../../../contexts/themeContext.js").ThemeContextState} */
  get themeState() {
    return this._themeConsumer.value.state;
  }
  /** @type {import("../../../contexts/themeContext.js").ThemeContextValue} */
  theme;
  get isDarkTheme() {
    return this.theme == "dark";
  }
  get selectedTheme() {
    return this.themeState.selectedTheme;
  }

  toggleTheme() {
    this.themeState.selectedTheme = this.isDarkTheme ? "light" : "dark";
    this._themeConsumer.value.update(this.themeState, true);
  }

  onClick() {
    this.toggleTheme();
  }

  get label() {
    return this.isDarkTheme ? "enable light theme" : "enable dark theme";
  }
  get iconName() {
    return this.isDarkTheme ? "moon" : "sun";
  }
  get variant() {
    return "neutral";
  }

  onSelect(event) {
    const { item } = event.detail;
    // console.log("onSelect", item);
    this.themeState.selectedTheme = item.value;
    this._themeConsumer.value.update(this.themeState, true);
  }

  renderDropdown() {
    return html`<wa-dropdown value="light" @wa-select=${this.onSelect}>
      <bw-header-button
        slot="trigger"
        icon-name=${this.iconName}
        variant=${this.variant}
        label=${this.label}
      >
      </bw-header-button>

      <wa-dropdown-item
        value="light"
        type="checkbox"
        ?checked=${this.selectedTheme == "light"}
      >
        <wa-icon slot="icon" name="sun"></wa-icon>
        Light
      </wa-dropdown-item>
      <wa-dropdown-item
        value="dark"
        type="checkbox"
        ?checked=${this.selectedTheme == "dark"}
      >
        <wa-icon slot="icon" name="moon"></wa-icon>
        Dark
      </wa-dropdown-item>
      <wa-divider></wa-divider>
      <wa-dropdown-item
        value="system"
        type="checkbox"
        ?checked=${this.selectedTheme == "system"}
      >
        <wa-icon slot="icon" name="circle-half-stroke"></wa-icon>
        System
      </wa-dropdown-item>
    </wa-dropdown>`;
  }

  renderToggle() {
    return html`<bw-header-button
      icon-name=${this.iconName}
      variant=${this.variant}
      @click=${this.onClick}
      label=${this.label}
    >
    </bw-header-button>`;
  }

  render() {
    return this.dropdown ? this.renderDropdown() : this.renderToggle();
  }
}
customElements.define("bw-menu-button-theme", MenuButtonTheme);
