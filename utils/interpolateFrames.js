export function interpolateFrames(frames, targetLength) {
  const interpolated = [];
  const repeat = Math.floor(targetLength / frames.length);

  frames.forEach((frame) => {
    for (let i = 0; i < repeat; i++) interpolated.push(frame);
  });

  // Se faltar algum frame para completar targetLength
  while (interpolated.length < targetLength) {
    interpolated.push(frames[frames.length - 1]);
  }

  return interpolated;
}
