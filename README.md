# Firestore-nGram-Search
Firestore-nGram-Search provides full-text search using nGram.  
Only Firebase 8 support.

- [x] Any language support  
- [x] Firestore query support
- [x] Works on client (limited)

## Usage

### Install
```
npm install firestore-ngram-search
```

### Initialize
#### Admin
```typescript
import * as admin from 'firebase-admin';
import FirestoreNGramSearch from 'firestore-ngram-search';

admin.initializeApp();
const db = admin.firestore();

// Specify the collection to store index.
const fooSearch = new FirestoreNGramSearch(db.collection('fooIndex'), 
    // Set nGram number. Default is 2.
    {n: 2});
```
#### Client
```typescript
import firebase from 'firebase';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Specify the collection to store index.
const fooSearch = new FirestoreNGramSearch(db.collection('fooIndex'))
```

### Add document
Works with only Admin SDK.
```typescript
const fooData: Foo = {
    title: 'Example document',
    description: 'Any language is supported. どの言語も対応しています。支持任何语言。',
    contents: 'FIREBASE 9 IS FULL OF BUGS.',
    likes: 10,
    createdAt: firestore.FieldValue.serverTimestamp()
}
const docRef = db.collection('foo').doc('fooID');

// Support WriteBatch.
const batch = db.batch();
batch.set(docRef, fooData);
await fooSearch.set(docRef, {
    // Supports batch.
    batch, data: fooData, 
    // Specify the fields to store in index.
    fields: ['title', 'description']
});
await batch.commit();
```
### Delete document
Works wih only Admin SDK.
```typescript
const docRef = db.collection('foo').doc('fooID');

const batch = db.batch();
batch.delete(docRef);
await fooSearch.delete(docRef);
await batch.commit();
```
### Search documents
```typescript
const query = 'Example'
const result = await contentsSearch.query()
    .search(query, {
        // Specify the fields to search.
        fields: ['title'],
        // Wheather search by each chars. Set false to search faster.
        searchByChar: true,
    })
    // Supports firestore query functions.
    .where('likes', '==', 10)
    .limit(10)
    .get();

result.hits.forEach(hit => {
    // This will be DocumentReference of 'fooID' in foo collection.
    console.log(hit.ref);
    // This will be DocumentData of 'fooID' in foo collection.
    console.log(hit.data);
})

```
## Caution
*DON'T use field name that starts with '__' in firestore document.  
