const Tokenizer = require('./tokenizer');

class InvertedIndex {
  constructor() {
    this.tokenizer = new Tokenizer();
    this.index = new Map(); //main index storage
  }
  addDocument(docId, content) {
    // tokenize the content
    const tokens = this.tokenizer.tokenize(content);

    // process each token
    tokens.forEach((token, position) => {
      // first, check if we've ever seen this token
      if (!this.index.has(token)) {
        // if its a new token, initialize its data structure
        this.index.set(token, new Map());
      }
      // get the documents map for this token
      const documentsMap = this.index.get(token);

      //  check if we have seen this token in this specific document
      if (!documentsMap.has(docId)) {
        // first time seeing token in this doc
        documentsMap.set(docId, {
          frequency: 1,
          positions: [position]
        });
      }
      else {
        // have seen this token in this document before
        const docInfo = documentsMap.get(docId);
        docInfo.frequency += 1;
        docInfo.positions.push(position)
      }
    })

  }
  searchDocument(query) {
    const tokens = this.tokenizer.tokenize(query);

    // for each token get all the documents containing it
    const matchingDocs = new Map();

    tokens.forEach(token => {
      // get all the documents with this token
      const documentsWithToken = this.index.get(token);

      if (documentsWithToken) {
        // for each doc containing this token
        documentsWithToken.forEach((docInfo, docId) => {
          if (!matchingDocs.has(docInfo)) {
            matchingDocs.set(docId, {
              matchCount: 1,
              terms: [token],
              totalFrequency: docInfo.frequency
            });
          }
          else {
            // document already matched another term
            const docMatch = matchingDocs.get(docId);
            docMatch.matchCount += 1;
            docMatch.terms.push(token);
            docMatch.totalFrequency += docInfo.frequency;
          }
        })
      }
    })
  }
}

