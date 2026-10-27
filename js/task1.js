"use strict";

const LIVES = 3; 
const WIN_STREAK = 8; 
const PROFESSIONS = [

  { name: "Knocker-up", icon: "bi-alarm", year: 1950 },
  { name: "Lamplighter", icon: "bi-lightbulb", year: 1930 },
  { name: "Human computer", icon: "bi-calculator", year: 1970 },
  { name: "Switchboard operator", icon: "bi-telephone", year: 1970 },
  { name: "Ice cutter", icon: "bi-snow", year: 1930 },
  { name: "Water carrier", icon: "bi-droplet", year: 1920 },
  { name: "Carriage driver", icon: "bi-car-front", year: 1915 },
  { name: "Linotype operator", icon: "bi-printer", year: 1985 },
  { name: "Film projectionist", icon: "bi-film", year: 2012 },
  { name: "Silent-film pianist", icon: "bi-music-note-beamed", year: 1929 },
];

const $ = (id) => document.querySelector("#" + id);
const panel = $("game-panel");
const choices = $("choices");
let current; 
let next; 
let lives;
let streak;
let best = 0; 
let gameOver;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickNext(previous) {
  let item;
  do {
    item = PROFESSIONS[randomInt(0, PROFESSIONS.length - 1)];
  } while (item === previous); 
  return item;
}

function say(text, kind) {
  const message = $("message");
  message.textContent = text;
  message.classList.remove("is-right", "is-wrong", "is-warn");
  message.classList.add("is-" + kind);
}

function showCard(prefix, item, showYear) {
  $(prefix + "-icon").className = "bi " + item.icon;
  $(prefix + "-name").textContent = item.name;
  $(prefix + "-year").textContent = showYear
    ? "Vanished around " + item.year
    : "Vanished around ????";
}

function render() {
  $("lives").textContent = "♥".repeat(lives) + "♡".repeat(LIVES - lives);
  $("streak").textContent = streak;
  $("best").textContent = best;
  showCard("cur", current, true);
  showCard("next", next, false);
  panel.classList.toggle("is-over", gameOver && lives === 0);
  panel.classList.toggle("is-win", gameOver && lives > 0);
  choices.classList.toggle("is-off", gameOver);
  choices.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-disabled", String(gameOver));
  });
}

function startGame() {
  lives = LIVES;
  streak = 0;
  gameOver = false;
  current = pickNext(null);
  next = pickNext(current);
  say("Did the job on the right vanish earlier or later than the one on the left?", "warn");
  render();
}

function guess(choice) {

  if (gameOver) {
    say("The game is over. Press “Play again” to start a new one.", "warn");
    return;
  }
  if (choice !== "earlier" && choice !== "later") {
    say("Choose “earlier” or “later”.", "warn");
    return;
  }

  const revealed = next;

  const isRight =
    (choice === "later" && revealed.year >= current.year) ||
    (choice === "earlier" && revealed.year <= current.year);

  if (isRight) {
    streak += 1;
    const isRecord = streak > best;
    if (isRecord) best = streak;
    say(
      `Right! ${revealed.name} vanished around ${revealed.year}.${isRecord ? " New best streak!" : ""}`,
      "right",
    );
  } else {
    lives -= 1;
    streak = 0;
    say(`Wrong. ${revealed.name} vanished around ${revealed.year}.`, "wrong");
  }

  if (streak === WIN_STREAK) {
    gameOver = true;
    say(`You win! ${WIN_STREAK} right answers in a row.`, "right");
  } else if (lives === 0) {
    gameOver = true;
    say(`Game over. ${revealed.name} vanished around ${revealed.year}.`, "wrong");
  }

  current = revealed;
  next = pickNext(current);
  render();
}

choices.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-choice]");
  if (button) guess(button.dataset.choice);
});
$("restart").addEventListener("click", startGame);

startGame();
