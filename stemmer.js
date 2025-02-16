class Stemmer {
  stem(word) {
    // type checking
    if (typeof word !== 'string') throw new Error('Input must be a string');
    if (!word.trim()) return '';
    if (word.length > 100) throw new Error('Word exceeds maximum length');
    // Non alphabetic character check
    if (!/^[a-zA-Z]+$/.test(word)) word = word.replace(/[^[a-zA-Z]]/g, '');

    try {
      word = word.toLowerCase();

      // handle special cases
      const specialCases = {

        'have': 'hav',
        'being': 'be',
        'goes': 'go',
        'went': 'go',
        'moved': 'move',
        'moving': 'move',
        // Irregular verbs
        'am': 'be',
        'is': 'be',
        'are': 'be',
        'was': 'be',
        'were': 'be',
        // Common irregulars
        'better': 'good',
        'best': 'good',
        'worse': 'bad',
        'worst': 'bad',

        // Irregular plurals
        'children': 'child',
        'mice': 'mouse',
        'feet': 'foot'

      }

      if (specialCases[word]) {
        return specialCases[word];
      }

      // handle plurlas ending with 'ies' (eg., cities -> city)
      if (word.endsWith('ies')) {
        return word.slice(0, -3) + 'y';
      }

      // handle words ending in 'ing'
      if (word.endsWith('ing')) {
        let stem = word.slice(0, -3);
        // handle double consonants (running -> run)
        if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
          stem = stem.slice(0, -1);
        }
        if (stem.length >= 3) {
          // for words like running -> run
          return stem;
        }
        return word;
      }

      // handle words ending with 'ed'
      if (word.endsWith('ed')) {
        let stem = word.slice(0, -2);
        // handle double consonants (dropped -> drop)
        if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
          stem = stem.slice(0, -1);
        }
        if (stem.length >= 3) {
          // for words like jumped -> jump
          return stem;
        }
        return word;
      }
      // handle plural forms, but not words like glass
      if (word.endsWith('s') && !word.endsWith('ss')) {
        // handle 'es'
        if (word.endsWith('es')) {
          return word.slice(0, -2);
        }
        return word.slice(0, -1);
      }
      return word;
    }
    catch (err) {
      console.error(`Error stemming word ${word}`, err)
      return word;
    }
  }
}

module.exports = Stemmer;