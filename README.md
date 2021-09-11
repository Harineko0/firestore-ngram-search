# Firestore-nGram-Search
Firestore-nGram-Search provides one-query full-text search using nGram.  
Works on Firebase 8.

## Usage
### Install
```
npm install firestore-ngram-search
```
### Server
#### Initialize
```typescript
import * as admin from 'firebase-admin';
import FirestoreNGramSearch from "firestore-ngram-search";

admin.initializeApp();
const db = admin.firestore();

// Specify the collection to store index
const fooSearch = new FirestoreNGramSearch(db.collection('fooIndex'));
```
#### Add document
```typescript
const fooData: Foo = {
    
}
```

## Caution
*DON'T use field name that starts with "__" in firestore document.  
*Only search function runs on client. Set function can only run with Admin SDK.
