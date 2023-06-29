let deckId = "";
let deckId2 = "";
let playerHand = [];
let dealerHand = [];
let cardCode = [];
let card;

function startGame() {
  resetGame();

  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((response) => response.json())
    .then((data) => {
      deckId = data.deck_id;

      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then((response) => response.json())
        .then((data) => {
          playerHand = data.cards;
          displayCards(playerHand, "player-hand");
          updateScore(calculateScore(playerHand), "player-score");
          console.log("cartas", data);
        })
        .catch((error) => {
          console.error("Ocorreu um erro:", error);
        });

      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then((response) => response.json())
        .then((data) => {
          dealerHand = data.cards;
          displayCards(dealerHand, "dealer-hand");
          updateScore(calculateScore(dealerHand), "dealer-score");
        })
        .catch((error) => {
          console.error("Ocorreu um erro:", error);
        });
    })
    .catch((error) => {
      console.error("Ocorreu um erro:", error);
    });
}

function resetGame() {
  deckId = "";
  playerHand = [];
  dealerHand = [];

  clearElement("player-hand");
  clearElement("dealer-hand");
  clearElement("player-score");
  clearElement("dealer-score");
  clearElement("result");

  enableButtons();
}

function next() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((response) => response.json())
    .then((data) => {
      if (data.cards && data.cards.length > 0) {
        const newCard = data.cards[0];
        playerHand.push(newCard);
        displayCard(newCard, "player-hand");
        updateScore(calculateScore(playerHand), "player-score");

        const playerScore = calculateScore(playerHand);
        if (playerScore > 21) {
          showResult("O jogador estourou. A casa ganha!");
          disableButtons();
          revealDealerCard();
        }
      }
    })
    .catch((error) => {
      console.error("Ocorreu um erro:", error);
    });
}

function stand() {
  disableButtons();
  revealDealerCard();

  function processNextDealerMove() {
    const dealerScore = calculateScore(dealerHand);
    if (dealerScore >= 18) {
      const playerScore = calculateScore(playerHand);
      if (dealerScore > 21 || playerScore > dealerScore) {
        showResult("O jogador ganha!");
      } else if (dealerScore > playerScore) {
        showResult("A casa ganha!");
      } else {
        showResult("Empate!");
      }
      updateScore(playerScore, "player-score");
      updateScore(dealerScore, "dealer-score");
    } else {
      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
        .then((response) => response.json())
        .then((data) => {
          if (data.cards && data.cards.length > 0) {
            const newCard = data.cards[0];
            dealerHand.push(newCard);
            displayCard(newCard, "dealer-hand");
            // Função recursiva para que o outro jogador chegue a 18 ou mais
            processNextDealerMove(); 
          }
        })
        .catch((error) => {
          console.error("Ocorreu um erro:", error);
        });
    }
  }

  processNextDealerMove();
}

function updateScore(score, scoreElementId) {
  const scoreElement = document.getElementById(scoreElementId);
  scoreElement.textContent = `Pontuação: ${score}`;
}

function showResult(resultText) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = resultText;
}

function clearElement(elementId) {
  const element = document.getElementById(elementId);
  element.innerHTML = "";
}

function revealDealerCard() {
  const dealerHandContainer = document.getElementById("dealer-hand");
  const cardElements = dealerHandContainer.getElementsByTagName("img");
  cardElements[0].src = dealerHand[0].image;
}

function enableButtons() {
  document.getElementById("hit-button").disabled = false;
  document.getElementById("stand-button").disabled = false;
}

function disableButtons() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;
}

function calculateScore(hand) {
  if (!hand || hand.length === 0) {
    console.error("A mão está vazia.");
    return 0;
  }

  let score = 0;
  let hasAce = false;

  hand.forEach((card) => {
    const value = card.value;
    if (value === "ACE") {
      score += 1;
      hasAce = true;
    } else if (value === "KING" || value === "QUEEN" || value === "JACK") {
      score += 10;
    } else {
      score += parseInt(value);
    }
  });

  if (hasAce && score > 21) {
    score -= 10;
  }

  return score;
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const confirmChange = document.getElementById("change-button");
  const hitButton = document.getElementById("hit-button");
  const standButton = document.getElementById("stand-button");
  const newGameButton = document.getElementById("new-game-button");
  const changeHandButton = document.getElementById("change-hand-button");

  hitButton.addEventListener("click", function () {
    next();
  });

  standButton.addEventListener("click", function () {
    stand();
  });

  newGameButton.addEventListener("click", function () {
    resetGame();
    startGame();
  });

  changeHandButton.addEventListener("click", function () {
    HandCardNames(playerHand, "card-names-textbox");
    showModal();
  });

  confirmChange.addEventListener("click", function () {
    updateHandFromCardNames();
    closeModal();
  });

  startGame();
});

function showModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function HandCardNames(hand, textboxId) {
  const textbox = document.getElementById(textboxId);
  const cardNames = hand.map((card) => {
    const valueMap = {
      ACE: "A",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "0",
      JACK: "J",
      QUEEN: "Q",
      KING: "K",
    };

    const suitMap = {
      SPADES: "S",
      DIAMONDS: "D",
      CLUBS: "C",
      HEARTS: "H",
    };

    const value = valueMap[card.value];
    const suit = suitMap[card.suit];
    return value + suit;
  });

  textbox.value = cardNames.join(", ");
}
//==============================================================
//ATUALIZA A MÃO
function updateHandFromCardNames() {
  const textbox = document.getElementById("card-names-textbox");
  const cardNames = textbox.value.split(", ");

  card = cardNames.length;

  const cardCodes = cardNames.map((cardName) => {
    let value;
    let suit;

    if (cardName.length === 2) {
      value = cardName[0];
      suit = cardName[1];
    } else {
      value = cardName.slice(0, -1);
      suit = cardName.slice(-1);
    }
    cardCode = `${value}${suit}`;
    return cardCode;
  });

  fetch(
    `https://www.deckofcardsapi.com/api/deck/new/shuffle/?cards=${cardCodes.join(
      ","
    )}`
  )
    .then((response) => response.json())
    .then((data2) => {
      deckId2 = data2.deck_id;
      console.log(deckId2);
      console.log("Mão atualizada com sucesso:", data2);

      console.log(card);
      fetch(
        `https://deckofcardsapi.com/api/deck/${deckId2}/draw/?count=${card}`
      )
        .then((response) => response.json())
        .then((data3) => {
          playerHand = data3.cards;
          clearElement("player-hand");
          displayCards(playerHand, "player-hand");
          updateScore(calculateScore(playerHand), "player-score");
          console.log("cartas", data3);
          closeModal();
        })
        .catch((error) => {
          console.error("Ocorreu um erro:", error);
        });
    });
}
//==============================================================

function displayCard(card, containerId) {
  const container = document.getElementById(containerId);
  const cardImage = document.createElement("img");
  cardImage.src = card.image;
  cardImage.className = "card";
  container.appendChild(cardImage);

  cardImage.addEventListener("mouseenter", function () {
    cardImage.classList.add("golden-border");
  });

  cardImage.addEventListener("mouseleave", function () {
    cardImage.classList.remove("golden-border");
  });
}

function displayCards(cards, elementId) {
  const element = document.getElementById(elementId);

  if (!cards || cards.length === 0) {
    console.error("Não há cartas para exibir.");
    return;
  }

  cards.forEach((card) => {
    const cardImage = document.createElement("img");
    cardImage.src = card.image;
    cardImage.alt = card.code;
    cardImage.className = "card";
    element.appendChild(cardImage);

    cardImage.addEventListener("mouseenter", function () {
      cardImage.classList.add("golden-border");
    });

    cardImage.addEventListener("mouseleave", function () {
      cardImage.classList.remove("golden-border");
    });
  });
}
