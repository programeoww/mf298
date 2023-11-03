import {IQuestion} from "@/interfaces";

const shuffle = (array: (string | number | string[] | null)[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 

function transformQuestion(questions: IQuestion[]) {
    return questions.map((question) => {
        return {
            question: question["Câu hỏi"],
            answers: shuffle(Object.keys(question).filter((key) => key.includes("Đáp án")).map((key) => question[key]).filter((answer) => answer !== null)),
            // correctAnswer: question['Đáp án 1 ( Đáp án đúng)']
        };
    });
}

export default transformQuestion;