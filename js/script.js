const url = "https://api.github.com/search/repositories";
const field = document.querySelector(".input__field");
const autocomplete = document.querySelector(".input__autocomplete");
const results = document.querySelector(".results");

function debounce(fn, ms) {
  let inDebounce;

  return function (...args) {
    return new Promise((resolve) => {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => resolve(fn.apply(this, args)), ms);
    });
  };
}

function createAutoCompleteElement(data) {
  const list = document.createElement("li");
  list.textContent = data.name;
  list.dataset.id = data.id;
  list.dataset.owner = data.owner.login;
  list.dataset.stars = data.stargazers_count;

  autocomplete.append(list);
  autocomplete.addEventListener("click", renderResults);
}

function fillAutoComplete(data) {
  autocomplete.innerHTML = "";

  if (data) {
    if (!data.total_count) autocomplete.textContent = "Ничего не найдено!";
    data.items.forEach(createAutoCompleteElement);
  }
}

function renderResults(element) {
  element.target.remove();

  results.innerHTML += `<li class="results__item">
  <div class="results__block">
    <p class="results__name">Name: ${element.target.textContent}</p>
    <p class="results__owner">Owner: ${element.target.dataset.owner}</p>
    <p class="results__stars">Starts: ${element.target.dataset.stars}</p>
  </div>
  <div class="button">
    <span class="button__left"></span>
    <span class="button__right"></span>
  </div>
  </li>`;

  results.addEventListener("click", onRemoveResult);

  if (!autocomplete.children.length) {
    field.value = "";
    autocomplete.removeEventListener("click", renderResults);
  }
}

function onRemoveResult(element) {
  if (element.target.classList.contains("button")) {
    element.target.parentElement.remove();
  }

  if (
    element.target.classList.contains("button__left") ||
    element.target.classList.contains("button__right")
  ) {
    element.target.parentElement.parentElement.remove();
  }

  if (!results.children.length)
    results.removeEventListener("click", onRemoveResult);
}

async function getRepos(query) {
  if (!field.value || !query.trim()) {
    autocomplete.innerHTML = "";
    autocomplete.removeEventListener("click", renderResults);
    return;
  }

  return await fetch(`${url}?q=${query}&per_page=5`)
    .then((response) => (response.ok ? response.json() : Promise.reject(res)))
    .catch((e) => console.log(e));
}

const debouncedGetRepos = debounce(getRepos, 500);

field.addEventListener("input", (event) =>
  debouncedGetRepos(event.target.value).then(fillAutoComplete)
);
