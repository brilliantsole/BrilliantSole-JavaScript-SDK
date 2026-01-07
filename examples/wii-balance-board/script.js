// WII BALANCE BOARD

import WIIBalanceBoard from "../utils/wiibalanceboard/wiibalanceboard.js";

/** @type {WIIBalanceBoard} */
var wiibalanceboard = undefined;

const toggleBoardConnectionButton = document.getElementById(
  "toggleBoardConnection"
);
toggleBoardConnectionButton.addEventListener("click", async () => {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }],
    });

    device = devices[0];
    wiibalanceboard = new WIIBalanceBoard(device);
  } catch (error) {
    console.log("An error occurred.", error);
  }

  if (!device) {
    console.log("No device was selected.");
  } else {
    console.log(`HID: ${device.productName}`);

    wiibalanceboard.BtnListener = (buttons) => {
      console.log({ buttons });
    };

    wiibalanceboard.WeightListener = (weights) => {
      console.log({ weights });
    };
  }
});
