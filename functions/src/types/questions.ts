interface QuestionType {
  id: string;
  category: string;
  type: string;
  difficulty: string;
  question: string;
  order: number;
}

interface AnswerType {
  id: string;
  correct_answer: string;
}

interface CorrectAnswerItem {
  [questionId: string]: string;
}

export { QuestionType, AnswerType, CorrectAnswerItem };
