import { waitForGlobals } from "../../../utils/cross-origin-storage-utils.js";

const { lit } = await waitForGlobals();

const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/card/card.js";

class Card extends LitElement {
  static properties = {
    label: {},
  };

  static styles = css`
    [class*="wa-stack"] {
      display: flex;
      flex-direction: column;
    }

    wa-card {
      padding: 0;
      --spacing: var(--wa-space-s);
      /* width: fit-content; */
    }
    wa-card::part(header) {
      padding-top: var(--wa-space-3xs);
      padding-bottom: var(--wa-space-3xs);
    }
    wa-card h3 {
      margin: 0;
    }

    .wa-gap-xs {
      gap: var(--wa-space-xs);
    }
    .wa-gap-s {
      gap: var(--wa-space-s);
    }
    .wa-heading-l {
      font-size: var(--wa-font-size-l);
    }
    [class*="wa-heading"] {
      font-family: var(--wa-font-family-heading);
      font-weight: var(--wa-font-weight-heading);
      line-height: var(--wa-line-height-condensed);
      /*text-wrap: balance;*/
      text-wrap: nowrap;
    }
  `;

  render() {
    return html`
      <wa-card>
        <h3 slot="header" class="wa-heading-l">${this.label}</h3>

        <div class="wa-stack wa-gap-s">
          <slot></slot>
        </div>

        <slot name="header-actions" slot="header-actions"> </slot>
      </wa-card>
    `;
  }
}

customElements.define("bw-card", Card);
