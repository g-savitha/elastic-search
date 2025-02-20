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
  searchDocument(query, searchType = 'OR') {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a non empty string')
    }

    const validTypes = ['OR', 'AND', 'PHRASE', 'PROXIMITY'];
    searchType = searchType.toUpperCase();

    if (!validTypes.includes(searchType)) {
      throw new Error(`Invalid search type. Must be one of: ${validTypes.join(', ')}`)
    }

    try {
      switch (searchType) {
        case 'OR':
          return this.searchOr(query);
        case 'AND':
          return this.searchAnd(query);
        case 'PHRASE':
          return this.searchPhrase(query);
        case 'PROXIMITY':
          return this.searchProximity(query); //default distance of 3 words
        default:
          return this.searchOr(query);
      }
    }
    catch (error) {
      console.error(`Search error: ${error.message}`);
      return new Map();
    }
  }
  // helper method to find documents containing a token
  getDocumentsForToken(token) {
    return this.index.get(token) || new Map();
  }
  // helper method to update matching documents
  updateMatchingDocs(matchingDocs, docId, token, docInfo) {
    if (!matchingDocs.has(docId)) {
      matchingDocs.set(docId, {
        matchCount: 1,
        terms: [token],
        totalFrequency: docInfo.frequency,
        positions: [docInfo.positions]
      })
    }
    else {
      const docMatch = matchingDocs.get(docId);
      docMatch.matchCount += 1;
      docMatch.terms.push(token);
      docMatch.totalFrequency += docInfo.frequency;
      docMatch.positions.push(docInfo.positions);
    }
  }

  searchOr(query) {
    const tokens = this.tokenizer.tokenize(query);
    // for each token get all the documents containing it
    const matchingDocs = new Map();

    tokens.forEach(token => {
      const documentsWithToken = this.getDocumentsForToken(token);

      documentsWithToken.forEach((docInfo, docId) => {
        this.updateMatchingDocs(matchingDocs, docId, token, docInfo);
      })

    })
    return matchingDocs;

  }
  searchAnd(query) {
    const tokens = this.tokenizer.tokenize(query);
    const matchingDocs = new Map();

    tokens.forEach(token => {
      const documentsWithToken = this.getDocumentsForToken(token);

      documentsWithToken.forEach((docInfo, docId) => {
        this.updateMatchingDocs(matchingDocs, docId, token, docInfo);
      })
    })
    return new Map(
      Array.from(matchingDocs).filter(([_, info]) =>
        info.matchCount === tokens.length
      )
    )
  }
  // searching for exact phrase
  searchPhrase(query) {
    const tokens = this.tokenizer.tokenize(query);
    if (tokens.length === 0) return new Map();

    const results = new Map();
    const firstToken = tokens[0];
    // Get docs containing first token
    const docsWithFirst = this.getDocumentsForToken(firstToken)

    docsWithFirst.forEach((docInfo, docId) => {
      // check each position of first token
      docInfo.positions.forEach(startPos => {
        // check if subsequent tokens appear in sequence
        if (this.checkPhraseMatch(tokens, docId, startPos)) {
          results.set(docId, {
            matchCount: tokens.length,
            terms: tokens,
            position: startPos,
            type: 'phrase',
          })
        }
      })
    })
    return results;
  }
  checkPhraseMatch(tokens, docId, startPos) {
    for (let i = 0; i < tokens.length; i++) {
      const docs = this.getDocumentsForToken(tokens[i]);
      const docInfo = docs.get(docId);

      if (!docId || !docInfo.positions.includes(startPos + i)) {
        return false;
      }
    }
    return true;
  }
  searchProximity(query, maxDistance = 3) {
    const tokens = this.tokenizer.tokenize(query);
    if (tokens.length < 2) return new Map();

    const results = new Map();
    const andResults = this.searchAnd(query);

    andResults.forEach((matchInfo, docId) => {
      // for each document, check token positions
      const proximityMatch = this.findProximityMatch(tokens, docId, maxDistance);
      if (proximityMatch) {
        results.set(docId, {
          ...matchInfo,
          ...proximityMatch,
          type: 'proximity'
        })
      }
    })
    return results;
  }
  findProximityMatch(tokens, docId, maxDistance) {
    const firstTokenDocs = this.getDocumentsForToken(tokens[0]);
    const secondTokenDocs = this.getDocumentsForToken(tokens[1]);


    const firstPositions = firstTokenDocs.get(docId)?.positions || [];
    const secondPositions = secondTokenDocs.get(docId)?.positions || [];

    let minDistance = Infinity;
    let matchedPositions = [];

    for (let pos1 of firstPositions) {
      for (let pos2 of secondPositions) {
        const distance = Math.abs(pos1 - pos2);
        if (distance <= maxDistance && distance < minDistance) {
          minDistance = distance;
          matchedPositions = [pos1, pos2];
        }
      }
    }
    if (minDistance <= maxDistance) {
      return {
        distance: minDistance,
        matchedPositions
      }
    }
    return null;
  }
}

const index = new InvertedIndex();

index.addDocument(1, "The quick brown fox jumps over the lazy dog");
index.addDocument(2, "Quick brown foxes are jumping over lazy dogs");
index.addDocument(3, "The brown dog sleeps while the fox jumps");
index.addDocument(4, "A fox and a dog are friends");


console.log(index.searchDocument("fox dog", "OR"));
console.log(index.searchDocument("quick brown", "AND"));
console.log("Phrase Search (brown fox):");
console.log(index.searchDocument("brown fox", "PHRASE"));
console.log("\nProximity Search (fox dog):");
console.log(index.searchDocument("fox dog", "PROXIMITY"));