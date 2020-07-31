export const getLevenDistance = function (a: string, b: string): number {
  // from https://gist.github.com/andrei-m/982927, MIT license
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

export const getLongestCommonSubstring = (
  str1: string,
  str2: string
): number => {
  let longestSubstring = "";
  let currentSubstring = "";
  for (let i = 0; i < str1.length; i++) {
    for (let j = 0; j < str2.length; j++) {
      if (str1[i] === str2[j]) {
        currentSubstring = str1[i];
        const remainingChars = Math.min(str1.length - i, str2.length - j);
        for (let k = 1; k < remainingChars; k++) {
          if (str1[i + k] === str2[j + k]) {
            currentSubstring += str1[i + k];
          } else {
            break;
          }
        }
        if (currentSubstring.length > longestSubstring.length) {
          longestSubstring = currentSubstring;
        }
      }
    }
  }
  return longestSubstring.length;
};

export const getDistancePercentage = (
  key: string,
  longestKeyLength: number,
  targetString: string,
  method: string
) => {
  let dist;
  switch (method) {
    case "leven":
      dist =
        (longestKeyLength -
          getLevenDistance(targetString.toLowerCase(), key.toLowerCase())) /
        longestKeyLength;
      break;
    case "lc substring":
      dist =
        getLongestCommonSubstring(
          targetString.toLowerCase(),
          key.toLowerCase()
        ) / targetString.length;
  }

  return dist;
};
