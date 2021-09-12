# Firestore-nGram-Search
Firestore-nGram-Search provides full-text search using nGram.  
Only Firebase 8 support.

## Usage

### Install
```
npm install firestore-ngram-search
```

### Initialize
#### Admin
```typescript
import * as admin from 'firebase-admin';
import FirestoreNGramSearch from "firestore-ngram-search";

admin.initializeApp();
const db = admin.firestore();

// Specify the collection to store index
const fooSearch = new FirestoreNGramSearch(db.collection('fooIndex'));
```
#### Client
```typescript
import firebase from 'firebase';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Specify the collection to store index
const fooSearch = new FirestoreNGramSearch(db.collection('fooIndex'))
```

### Add document
Works on only Admin SDK.
```typescript
const fooData: Foo = {
    title: "foo title",
    description: "foo description",
    createdAt: firestore.FieldValue.serverTimestamp()
}

const docRef = db.collection('foo').doc();

// Support WriteBatch
const batch = db.batch();
batch.set(docRef, fooData);
const searchOptions = {
    // Supports batch
    batch: batch, 
    data: fooData, 
    // Specify the fields to store in index
    fields: ['title']
};
await fooSearch.set(docRef, searchOptions);
await batch.commit();
```

### Search documents
```typescript

```
## Caution
*DON'T use field name that starts with "__" in firestore document.  
*Only search function runs on client. Set function can only run with Admin SDK.
