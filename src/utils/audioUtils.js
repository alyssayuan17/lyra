export const computeRMS = (chunk) => {
    const sumSquares = chunk.reduce((sum, sample) => sum + sample * sample, 0);
    return Math.sqrt(sumSquares / chunk.length);
  };
  
  export const getMidi = (freq) => Math.round(69 + 12 * Math.log2(freq / 440));