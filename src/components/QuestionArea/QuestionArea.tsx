import { useState } from 'react';
import './QuestionArea.scss';
import pokeballPresentation from '../../img/pokeball_presentation.png';

interface QuestionAreaProps {
  question: string;
}

function QuestionArea({ question }: QuestionAreaProps) {

  const firstTimeDescription = "Bienvenue sur Pokinator, l'assisant qui lit dans tes pensées, je vais te poser une série de questions auxquelles tu pourras répondre via un click sur la Pokéball comme indiqué ci-contre, après avoir trouvé ton Pokémon celui-ci sera affiché dans la liste présente au bas de la page."
  const [firstTime, setFirstTime] = useState(localStorage.getItem("firstTime"));

  const updateFirstTime = () => {
    localStorage.setItem("firstTime", "false");
    setFirstTime("false");
  }

  return (
    <div className="question_area">
      {firstTime === "false" ? (
      <p>{question}</p>
      ) : (
        <div className='first_time_container'>
          <div>
            <p>{firstTimeDescription}</p>
            <button onClick={updateFirstTime}>Attrapez-les tous !</button>
          </div>
          <div>
            <img src={pokeballPresentation} alt="" />
          </div>
        </div>
      )
        }
    </div>
  );
}

export default QuestionArea;
