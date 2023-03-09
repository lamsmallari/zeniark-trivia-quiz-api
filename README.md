# Zeniark Trivia Quiz API - Solution

I've modified the structure of the mock data a bit to integrate in Firestore collections approach. But we can still use the original data structure when we upload it. See the page _data-debug_ from my [front-end repository](https://github.com/lamsmallari/zeniark-trivia-quiz-app) how I transformed it and upload it to Firestore with the POST route.

Here's an example query for getting the first 10 items ordered by _order_ property using Firestore SDK:

    const questionsRef = db
    .firestore()
    .collection("questionSets")
    .doc("exampleSetIdString")
    .collection("questions")
    .orderBy("order")
    .limit(Number(req.params.limit) || 10);

Source: https://firebase.google.com/docs/firestore/query-data/get-data

## Available routes

    GET /questions/:setId/:limit

Returns a set of questions with given limit

    GET /questions/result

Returns correct answers from the list of question IDs. Required params below:

1. data: array of question item IDs
2. setId: Unique ID of the question set

I haven't included the POST route because I've only use it for uploading required data in database.

Please let me know what you think. There's a lot of room for improvement but I have little time to do so. I'm open to any constructive criticism because I'm still learning. Thanks a lot!
