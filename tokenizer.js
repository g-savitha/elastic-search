const Stemmer = require('./stemmer');
class Tokenizer {
  constructor() {
    this.stemmer = new Stemmer();
    // common contractions we might encounter
    this.contractions = {
      "won't": "will not",
      "can't": "cannot",
      "i'm": "i am",
      "i'll": "i will",
      "i'd": "i would",
      "i've": "i have"
    }
  }
  tokenize(text) {
    // convert text to lowercase
    text = text.toLowerCase();

    // replace any contractions
    for (let [contractions, expansions] of Object.entries(this.contractions)) {
      text = text.replace(contractions, expansions);
    }

    // Handle hyphenated words
    text = text.replace(/-/g, ' ');

    // remove punctuations
    text = text.replace(/[.,!?;:'"()]/g, '');

    // split into tokens, remove empty strings and apply stemming
    return text.split(' ').filter(token => token.length > 0).map(token => this.stemmer.stem(token));

  }
}

const tokenizer = new Tokenizer();
const text = "Cities are running and dropping boxes. The boxes have been moved. She goes and went there.";
console.log(tokenizer.tokenize(text))