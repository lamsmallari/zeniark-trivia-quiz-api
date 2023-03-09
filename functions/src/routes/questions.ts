const expQuestions = require("express");
const router = expQuestions.Router();

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {
  QuestionType,
  AnswerType,
  CorrectAnswerItem,
} from "../types/questions";

admin.initializeApp();

router.get("/", (req: any, res: any) => {
  res.send(`Ok`);
});

// Add Question Set
router.post(
  "/",
  async (
    req: { body: { questions: QuestionType[]; answers: AnswerType[] } },
    res: any
  ) => {
    const { questions, answers } = req.body;

    const questionSetRef = admin.firestore().collection("questionSets").doc();
    const questionsRef = admin
      .firestore()
      .collection("questionSets")
      .doc(questionSetRef.id)
      .collection("questions");

    try {
      // 1. create questionSets > [docId]
      await questionSetRef.create({
        correct_answers: answers,
      });

      // 2. start creating questions
      const questionsBatch = admin.firestore().batch();
      questions.forEach((value: { [key: string]: any }) => {
        questionsBatch.set(questionsRef.doc(value.id), {
          ...value,
          setId: questionSetRef.id,
        });
      });

      await questionsBatch.commit();

      res.status(200).end();
    } catch (error) {
      console.log("POST questions error: ", error);

      let errorMsg = "";
      if (error instanceof Error) errorMsg = error.message;
      throw new functions.https.HttpsError("unknown", errorMsg, error);
    }
  }
);

// Result
router.get("/result", async (req: any, res: any) => {
  const questionIds = req.query.data;
  const setId: string = req.query.setId;

  if (!questionIds || questionIds.length === 0 || questionIds === undefined) {
    res.status(200).json(JSON.stringify([]));
  }

  // Query correct answers from given setId
  const correctAnswersRef = admin
    .firestore()
    .collection("questionSets")
    .doc(setId);

  try {
    const correctAnswers = await correctAnswersRef.get();
    const decodedData = decodeURIComponent(questionIds);
    const parsedQuestionIds = JSON.parse(decodedData);

    if (correctAnswers.exists) {
      const { correct_answers } = correctAnswers.data()!;
      const correctAnswersList: CorrectAnswerItem[] = parsedQuestionIds.map(
        (questionId: string) => {
          return {
            [questionId]: correct_answers[questionId],
          };
        }
      );

      // Return list of correctanswers
      res.status(200).json(JSON.stringify(correctAnswersList));
    } else {
      res.status(200).json(JSON.stringify([]));
    }
  } catch (error) {
    console.log("GET questions error: ", error);

    let errorMsg = "";
    if (error instanceof Error) errorMsg = error.message;
    throw new functions.https.HttpsError("unknown", errorMsg, error);
  }
});

router.route("/:setId/:limit").get(async (req: any, res: any) => {
  // Get Question Set
  const questionsRef = admin
    .firestore()
    .collection("questionSets")
    .doc(req.params.setId)
    .collection("questions")
    .orderBy("order")
    .limit(Number(req.params.limit) || 10);

  const querySnapshot = await questionsRef.get();
  const questionList: QuestionType[] = [];

  try {
    querySnapshot.forEach((doc) => {
      questionList.push(doc.data() as QuestionType);
    });

    res.status(200).json(JSON.stringify(questionList));
  } catch (error) {
    console.log("GET questions error: ", error);

    let errorMsg = "";
    if (error instanceof Error) errorMsg = error.message;
    throw new functions.https.HttpsError("unknown", errorMsg, error);
  }
});

module.exports = router;
