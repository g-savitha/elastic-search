class Tokenizer {
  constructor() {
    // common contractions we might encounter
    this.contractions = {
      "won't": "will not",
      "can't": "can not",
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

    // split into tokens and remove empty strings
    return text.split(' ').filter(token => token.length > 0)

  }
}

const tokenizer = new Tokenizer();
const text = "I'm writing quick-brown text, won't you test it?";
console.log(tokenizer.tokenize(text))