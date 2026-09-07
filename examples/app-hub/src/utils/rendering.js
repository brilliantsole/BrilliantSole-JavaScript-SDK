export async function waitForAnimationFrames(frameCount = 1) {
  if (frameCount <= 0) {
    return;
  }

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
  await waitForAnimationFrames(frameCount - 1);
}
