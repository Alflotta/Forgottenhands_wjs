"use strict";

const MIN_WORDS = 20;
const MAX_WORDS = 120;
const MIN_YEAR = 1500;
const MAX_YEAR = new Date().getFullYear();
const TAKEN_EMAILS = ["test@example.com", "anna@example.com", "mario@example.com"];
const CATALOG = [
  "knocker-up",
  "lamplighter",
  "human computer",
  "switchboard operator",
  "ice cutter",
  "water carrier",
  "carriage driver",
  "linotype operator",
  "film projectionist",
  "silent-film pianist",
];
const KIND_LABELS = { story: "Family story", new: "New profession", fix: "Correction" };
const FIELD_NAMES = ["kind", "job", "from", "to", "story", "name", "email", "consent"];

const form = document.querySelector("#story-form");
form.noValidate = true;
const summary = document.querySelector("#form-summary");
const result = document.querySelector("#result");
const fields = {};
FIELD_NAMES.forEach((name) => {
  fields[name] = document.querySelector("#" + name);
});
const touched = new Set();

function countWords(text) {
  const clean = text.trim();
  return clean === "" ? 0 : clean.split(/\s+/).length;
}

function yearError(value) {
  if (value === "") return "Enter a year.";
  const year = Number(value);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return `Enter a year from ${MIN_YEAR} to ${MAX_YEAR}.`;
  }
  return "";
}

const rules = {
  kind: () => "",

    job: () => {
    const value = fields.job.value.trim().toLowerCase();
    if (value === "") return "Enter the name of the profession.";
    const inCatalog = CATALOG.includes(value);
    if (fields.kind.value === "new" && inCatalog) {
      return "This profession is already in the catalog. Choose another one or change the type.";
    }
    if (fields.kind.value !== "new" && !inCatalog) {
      return 'We cannot find it in the catalog. Check the spelling or choose "New profession".';
    }
    return "";
  },

  from: () => yearError(fields.from.value),

 
  to: () => {
    const own = yearError(fields.to.value);
    if (own !== "") return own;
    const fromIsValid = yearError(fields.from.value) === "";
    if (fromIsValid && Number(fields.to.value) < Number(fields.from.value)) {
      return "The end year cannot be earlier than the start year.";
    }
    return "";
  },


  story: () => {
    const words = countWords(fields.story.value);
    if (words < MIN_WORDS) return `Write at least ${MIN_WORDS} words (now ${words}).`;
    if (words > MAX_WORDS) return `Please keep it under ${MAX_WORDS} words (now ${words}).`;
    return "";
  },

  name: () => {
    const value = fields.name.value.trim();
    if (value.length < 2) return "Enter your name (at least 2 letters).";
    if (/\d/.test(value)) return "The name cannot contain digits.";
    return "";
  },

  email: () => {
    const value = fields.email.value.trim().toLowerCase();
    if (value === "") return "Enter your email.";
    if (!fields.email.checkValidity()) return "Enter a valid email, for example name@example.com.";
    if (TAKEN_EMAILS.includes(value))
      return "This email has already sent a story. Use another one.";
    return "";
  },

  consent: () => (fields.consent.checked ? "" : "Please confirm that we may publish your text."),
};


function validateField(name) {
  const message = rules[name]();
  const field = fields[name];
  document.querySelector("#" + name + "-error").textContent = message;
  field.classList.toggle("is-invalid", message !== "");
  field.classList.toggle("is-valid", message === "");
  field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  refreshSummary();
  return message === "";
}

function refreshSummary() {
  if (summary.hidden) return;
  const count = FIELD_NAMES.filter((name) => fields[name].classList.contains("is-invalid")).length;
  summary.hidden = count === 0;
  summary.textContent =
    count === 1 ? "1 field needs your attention." : `${count} fields need your attention.`;
}

function setText(id, text, fallback) {
  const element = document.querySelector("#" + id);
  const clean = text.trim();
  element.textContent = clean || fallback;
  element.classList.toggle("is-placeholder", clean === "");
}

function updatePreview() {
  setText("pv-kind", KIND_LABELS[fields.kind.value], "");
  setText("pv-job", fields.job.value, "Profession name");
  const from = fields.from.value;
  const to = fields.to.value;
  setText("pv-period", from || to ? `${from || "?"} – ${to || "?"}` : "", "Period");
  const story = fields.story.value.trim();
  setText(
    "pv-story",
    story.length > 160 ? story.slice(0, 160) + "…" : story,
    "Your story will appear here as you type.",
  );
  setText("pv-name", fields.name.value ? "By " + fields.name.value.trim() : "", "By: your name");

  const words = countWords(fields.story.value);
  const counter = document.querySelector("#story-count");
  counter.textContent = `${words} words (from ${MIN_WORDS} to ${MAX_WORDS})`;
  counter.classList.toggle("is-ok", words >= MIN_WORDS && words <= MAX_WORDS);
}


const dependents = { kind: "job", from: "to" }; 

FIELD_NAMES.forEach((name) => {
  const field = fields[name];

  field.addEventListener("blur", () => {
    touched.add(name);
    validateField(name);
  });

  const liveEvent = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
  field.addEventListener(liveEvent, () => {
    if (touched.has(name)) validateField(name);
    const dependent = dependents[name];
    if (dependent && touched.has(dependent)) validateField(dependent);
    updatePreview();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const invalid = FIELD_NAMES.filter((name) => {
    touched.add(name);
    return !validateField(name);
  });

  if (invalid.length > 0) {
    summary.hidden = false;
    refreshSummary();
    fields[invalid[0]].focus(); 
    return;
  }

  summary.hidden = true;
  showResult();
  resetForm();
});

function showResult() {
  const code = "FH-" + (Math.floor(Math.random() * 9000) + 1000); // 1000 to 9999
  const card = document.createElement("article");
  card.className = "result-card";

  const title = document.createElement("h2");
  title.className = "h4";
  title.textContent = `Thank you, ${fields.name.value.trim().split(/\s+/)[0]}!`;

  const text = document.createElement("p");
  text.textContent =
    `Your ${KIND_LABELS[fields.kind.value].toLowerCase()} about "${fields.job.value.trim()}" ` +
    `(${fields.from.value} – ${fields.to.value}) is on its way to the library.`;

  const number = document.createElement("p");
  number.className = "result-code mb-0";
  number.textContent = "Submission number: " + code;

  card.append(title, text, number);
  result.replaceChildren(card);
  result.focus();
}

function resetForm() {
  form.reset();
  touched.clear();
  FIELD_NAMES.forEach((name) => {
    fields[name].classList.remove("is-invalid", "is-valid");
    fields[name].removeAttribute("aria-invalid");
    document.querySelector("#" + name + "-error").textContent = "";
  });
  updatePreview();
}

updatePreview(); 
