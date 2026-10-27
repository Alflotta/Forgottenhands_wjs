"use strict";


const MAX_DOING = 3; 
const COLUMNS = ["todo", "doing", "done"];
const COLUMN_TITLES = { todo: "To read", doing: "Reading", done: "Done" };
const PRIORITY_LABELS = { 1: "Low", 2: "Medium", 3: "High" };
const cards = [
  {
    id: 1,
    title: "Knocker-up",
    tag: "Light & Night",
    priority: 2,
    minutes: 4,
    important: false,
    column: "todo",
  },
  {
    id: 2,
    title: "Lamplighter",
    tag: "Light & Night",
    priority: 3,
    minutes: 5,
    important: true,
    column: "doing",
  },
  {
    id: 3,
    title: "Human computer",
    tag: "Science",
    priority: 3,
    minutes: 6,
    important: true,
    column: "todo",
  },
  {
    id: 4,
    title: "Switchboard operator",
    tag: "Communication & News",
    priority: 1,
    minutes: 3,
    important: false,
    column: "done",
  },
  {
    id: 5,
    title: "Ice cutter",
    tag: "Home & Daily Life",
    priority: 1,
    minutes: 4,
    important: false,
    column: "todo",
  },
  {
    id: 6,
    title: "Water carrier",
    tag: "Transport & Water",
    priority: 2,
    minutes: 5,
    important: false,
    column: "todo",
  },
  {
    id: 7,
    title: "Carriage driver",
    tag: "Transport & Water",
    priority: 2,
    minutes: 4,
    important: false,
    column: "doing",
  },
  {
    id: 8,
    title: "Linotype operator",
    tag: "Communication & News",
    priority: 1,
    minutes: 7,
    important: false,
    column: "todo",
  },
  {
    id: 9,
    title: "Film projectionist",
    tag: "Cinema",
    priority: 3,
    minutes: 5,
    important: true,
    column: "todo",
  },
  {
    id: 10,
    title: "Silent-film pianist",
    tag: "Cinema",
    priority: 2,
    minutes: 3,
    important: false,
    column: "done",
  },
];

const $ = (id) => document.querySelector("#" + id);
const board = $("board");
let filterTag = "all";
let searchText = "";
let sortOrder = "high";

function say(text, kind) {
  const message = $("board-message");
  message.textContent = text;
  message.classList.remove("is-ok", "is-blocked");
  message.classList.add("is-" + kind);
}

function countIn(column) {
  return cards.filter((card) => card.column === column).length;
}

function matches(card) {
  const tagOk = filterTag === "all" || card.tag === filterTag;
  const textOk = card.title.toLowerCase().includes(searchText);
  return tagOk && textOk;
}

function byPriority(a, b) {
  const difference = sortOrder === "high" ? b.priority - a.priority : a.priority - b.priority;
  return difference !== 0 ? difference : a.title.localeCompare(b.title);
}

function summarize() {
  let done = 0;
  let minutes = 0;
  for (const card of cards) {
    if (card.column === "done") {
      done += 1;
      minutes += card.minutes;
    }
  }
  $("progress").max = cards.length;
  $("progress").value = done;
  $("progress-text").textContent =
    `${done} of ${cards.length} finished (${minutes} min of reading)`;
}

function makeButton(card, action, label, symbol, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "kbtn";
  button.dataset.id = card.id;
  button.dataset.action = action;
  button.setAttribute("aria-label", `${label}: ${card.title}`);
  button.textContent = symbol;
  button.disabled = disabled;
  return button;
}

function createCard(card) {
  const element = document.createElement("article");
  element.className = "kcard";
  element.classList.add("priority-" + PRIORITY_LABELS[card.priority].toLowerCase());
  element.classList.toggle("is-important", card.important);

  const title = document.createElement("h3");
  title.textContent = (card.important ? "★ " : "") + card.title;

  const info = document.createElement("p");
  info.className = "kinfo";
  info.textContent = `${card.tag} · ${PRIORITY_LABELS[card.priority]} priority · ${card.minutes} min`;

  const actions = document.createElement("div");
  actions.className = "kactions";
  const index = COLUMNS.indexOf(card.column);
  actions.append(
    makeButton(card, "back", "Move back", "←", index === 0),
    makeButton(card, "forward", "Move forward", "→", index === COLUMNS.length - 1),
  );

  element.append(title, info, actions);
  return element;
}

function render() {
  const visible = cards.filter(matches).sort(byPriority);

  COLUMNS.forEach((column) => {
    const box = document.querySelector(`[data-cards="${column}"]`);
    const inColumn = visible.filter((card) => card.column === column);
    box.replaceChildren(...inColumn.map(createCard));
    if (inColumn.length === 0) {
      const empty = document.createElement("p");
      empty.className = "kempty";
      empty.textContent = "Nothing here yet.";
      box.append(empty);
    }
    const limit = column === "doing" ? ` (${countIn("doing")}/${MAX_DOING})` : "";
    document.querySelector(`[data-count="${column}"]`).textContent = inColumn.length + limit;
  });

  const nothing = $("no-results");
  nothing.hidden = visible.length > 0;
  nothing.textContent = `No cards match “${searchText}”. Try another word or drawer.`;
  summarize();
}

function move(id, step) {
  const card = cards.find((item) => item.id === id);
  const target = COLUMNS[COLUMNS.indexOf(card.column) + step];
  if (target === undefined) return;

  if (target === "doing" && countIn("doing") >= MAX_DOING) {
    say(
      `The “Reading” column holds at most ${MAX_DOING} cards. Finish one of them first.`,
      "blocked",
    );
    return;
  }
  card.column = target;
  say(`“${card.title}” moved to “${COLUMN_TITLES[target]}”.`, "ok");
  render();
}

board.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  move(Number(button.dataset.id), button.dataset.action === "forward" ? 1 : -1);
});

$("search").addEventListener("input", (event) => {
  searchText = event.target.value.trim().toLowerCase();
  render();
});
$("filter").addEventListener("change", (event) => {
  filterTag = event.target.value;
  render();
});
$("sort").addEventListener("change", (event) => {
  sortOrder = event.target.value;
  render();
});

const tags = [];
for (const card of cards) {
  if (!tags.includes(card.tag)) tags.push(card.tag);
}
tags.forEach((tag) => {
  const option = document.createElement("option");
  option.value = tag;
  option.textContent = tag;
  $("filter").append(option);
});
render();
