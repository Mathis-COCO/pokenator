import React from 'react';
import './PokeballAnswers.scss'; // Assurez-vous que le chemin est correct

interface PokeballAnswersProps {
    onAnswer: (answer: string) => void;
}

function PokeballAnswers({ onAnswer }: PokeballAnswersProps) {
    const handleTopClick = () => {
        onAnswer('oui'); // Appeler la fonction passée en prop avec la réponse
    };

    const handleMiddleClick = () => {
        onAnswer('je sais pas'); // Appeler la fonction passée en prop avec la réponse
    };

    const handleBottomClick = () => {
        onAnswer('non'); // Appeler la fonction passée en prop avec la réponse
    };

    return (
        <div className="pokeball">
            <div className="top" onClick={handleTopClick}>
                <span className="text">Oui</span>
            </div>
            <div className="middle" onClick={handleMiddleClick}>
                <div className="center">
                    <span className="text">?</span>
                </div>
            </div>
            <div className="bottom" onClick={handleBottomClick}>
                <span className="text">Non</span>
            </div>
        </div>
    );
}

export default PokeballAnswers;