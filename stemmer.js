class Stemmer {
  stem(word) {
    word = word.toLowerCase();

    // handle common endings
    if (word.endsWith('ing')) {
      let stem = word.slice(0, -3);
      if (stem.length >= 3) {
        // for words like running -> run
        return stem;
      }
      return word;
    }

    // handle past tense
    if (word.endsWith('ed')) {
      let stem = word.slice(0, -2);
      if (stem.length >= 3) {
        // for words like jumped -> jump
        return stem;
      }
      return word;
    }
    // handle plural forms, but not words like glass
    if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  }
}

module.exports = Stemmer;