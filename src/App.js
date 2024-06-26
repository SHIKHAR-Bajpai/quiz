import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // For 10 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // Tracking selected option
  const [quizCompleted, setQuizCompleted] = useState(false); // Tracking quiz completion

  useEffect(() => {
    // Taking questions from question.json
    fetch(`${process.env.PUBLIC_URL}/questions.json`)
      .then(response => response.json())
      .then(data => setQuestions(data));

    // function for full screen
    const handleFullScreenChange = () => {
      setIsFullScreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    // Loading data from localStorage
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
      setCurrentQuestion(savedState.currentQuestion);
      setScore(savedState.score);
      setTimeLeft(savedState.timeLeft);
      setQuizStarted(savedState.quizStarted);
    }

    // Funtion for Timer
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleQuizCompletion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    // Saving current state to localStorage if quiz is started then only
    if (quizStarted) {
      localStorage.setItem('quizState', JSON.stringify({ currentQuestion, score, timeLeft, quizStarted }));
    }
  }, [currentQuestion, score, timeLeft, quizStarted]);

  const handleAnswerOptionClick = (isCorrect, index) => {
    setSelectedOption(index); // selected option by user
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    setTimeout(() => {
      setSelectedOption(null); // Resetting selected option for the next question
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        handleQuizCompletion();
      }
    }, 500);
  };

  const handleQuizCompletion = () => {
    setQuizCompleted(true);
    setQuizStarted(false);
    localStorage.removeItem('quizState'); // Clearing state and localStorage
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  };

  //Function for Clearing all local storage data and reloading the page
  const handleRestartQuiz = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleReturnToFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  };

  const renderFeedback = () => {
    if (score < 4) {
      return <p>You need to work hard.</p>;
    } else if (score >= 4 && score <= 7) {
      return <p>Nice, you can perform better.</p>;
    } else {
      return <p>Well Done!! Keep it up.</p>;
    }
  };

  const renderQuizCompletion = () => {
    if (timeLeft === 0) {
      return <p>Ohh!! You ran out of time.</p>;
    } else {
      return (
        <>
          <p>Your score: {score}</p>
          {renderFeedback()}
        </>
      );
    }
  };

  if (!quizStarted && !quizCompleted) {
    return (
      <div className="app">
        <h1>Welcome to the Quiz</h1>
        <button onClick={handleStartQuiz}>Start Quiz</button>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="app">
        <h1>Quiz Completed!</h1>
        {renderQuizCompletion()}
        <button onClick={handleRestartQuiz}>Restart Quiz</button> {/* Button to reload the page and start the quiz */}
      </div>
    );
  }

  return (
    <div className="app">
      {!isFullScreen && (
        <div className="fullscreen-warning">
          <p>Please return to fullscreen mode to continue the quiz.</p>
          <button onClick={handleReturnToFullScreen}>Go Fullscreen</button>
        </div>
      )}
      {isFullScreen && questions.length > 0 && (
        <>
          <div className="timer">Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
          <div className="quiz-container">
            <div className="question-section">
              <div className="question-count">
                <span>Question {currentQuestion + 1}</span>/{questions.length}
              </div>
              <div className="question-text">{questions[currentQuestion].question}</div>
            </div>
            <div className="answer-section">
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="answer-option">
                  <button
                    className={selectedOption === index ? 'selected' : ''}
                    onClick={() => handleAnswerOptionClick(option === questions[currentQuestion].answer, index)}
                  >
                    {option}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
