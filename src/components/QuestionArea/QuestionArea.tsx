import './QuestionArea.scss';

interface QuestionAreaProps {
  question: string;
}

function QuestionArea({ question }: QuestionAreaProps) {
  return (
    <div className="question_area">
      <p>{question}</p>
    </div>
  );
}

export default QuestionArea;
