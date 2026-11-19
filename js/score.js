/**
 * Numbers of decimal digits to round to
 */
const scale = 3;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
let N = 0;

/**
 * Fetches data/_list.json, counts the levels, and updates variable N.
 * @param {string} listPath - Path to _list.json (defaults to "data/_list.json")
 * @param {function(number): void} [onUpdate] - Optional callback run once N is updated
 */
async function getLevelCount(listPath = "data/_list.json", onUpdate) {
  try {
    const response = await fetch(listPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} while fetching ${listPath}`);
    }

    const levels = await response.json();

    if (!Array.isArray(levels)) {
      throw new Error("_list.json does not contain a JSON array.");
    }

    N = levels.length;

    if (typeof onUpdate === "function") {
      onUpdate(N);
    }

    return N;
  } catch (err) {
    console.error("Failed to count levels:", err);
    N = 0;
    return N;
  }
}

// Example usage: display N in the console and/or a DOM element
getLevelCount("data/_list.json", (count) => {
  console.log("Total levels (N):", count); // Will log 3 for ["SampleLevel1", "SAMPLELEVEL2", "Sample_Level_3"]

  // Optional: display N inside an HTML element like <span id="level-count"></span>
  const el = document.getElementById("level-count");
  if (el) {
    el.textContent = N;
  }
});
export function score(rank, percent, minPercent) {
    if (rank > 150) {
        return 0;
    }
    if (rank > 75 && percent < 100) {
        return 0;
    }

    // Old formula
    /*
    let score = (100 / Math.sqrt((rank - 1) / 50 + 0.444444) - 50) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    // New formula
    let score = (350 * Math.pow(1 / 7, (rank - 1) / (N - 1))) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
