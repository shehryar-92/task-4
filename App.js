
'use strict';

(function () {
  const STORAGE_KEY = 'worldclock.cities';

  const searchInput = document.getElementById('city-search');
  const suggestionsList = document.getElementById('city-suggestions');
  const clockList = document.getElementById('clock-list');
  const emptyState = document.getElementById('empty-state');
  const cardTemplate = document.getElementById('clock-card-template');

  const allTimezones = window.helpers.getSupportedTimezones();

  /** Cities currently shown, in order. Array of IANA timezone strings. */
  let cities = loadCities();
  let activeSuggestionIndex = -1;

  init();

  function init() {
    if (cities.length === 0) {
      const local = window.helpers.detectLocalTimezone();
      if (window.helpers.isValidTimezone(local)) {
        cities = [local];
        saveCities();
      }
    }

    render();
    tick();
    setInterval(tick, 1000);

    searchInput.addEventListener('input', onSearchInput);
    searchInput.addEventListener('keydown', onSearchKeydown);
    document.addEventListener('click', onDocumentClick);
  }

  // ---- Storage ----

  function loadCities() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(window.helpers.isValidTimezone) : [];
    } catch {
      return [];
    }
  }

  function saveCities() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    } catch {
      // localStorage unavailable (e.g. private browsing) — fail silently,
      // the app still works for the current session.
    }
  }

  // ---- Search / suggestions ----

  function onSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    activeSuggestionIndex = -1;

    if (query === '') {
      hideSuggestions();
      return;
    }

    const matches = allTimezones
      .filter((tz) => tz.toLowerCase().includes(query))
      .slice(0, 8);

    showSuggestions(matches);
  }

  function showSuggestions(matches) {
    suggestionsList.innerHTML = '';

    if (matches.length === 0) {
      hideSuggestions();
      return;
    }

    matches.forEach((tz) => {
      const li = document.createElement('li');
      li.textContent = `${window.helpers.getShortCityName(tz)} — ${tz}`;
      li.dataset.timezone = tz;
      li.addEventListener('click', () => addCity(tz));
      suggestionsList.appendChild(li);
    });

    suggestionsList.hidden = false;
  }

  function hideSuggestions() {
    suggestionsList.hidden = true;
    suggestionsList.innerHTML = '';
  }

  function onSearchKeydown(event) {
    const items = Array.from(suggestionsList.children);
    if (suggestionsList.hidden || items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
      highlightActiveSuggestion(items);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
      highlightActiveSuggestion(items);
    } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      addCity(items[activeSuggestionIndex].dataset.timezone);
    } else if (event.key === 'Escape') {
      hideSuggestions();
    }
  }

  function highlightActiveSuggestion(items) {
    items.forEach((item, index) => {
      item.classList.toggle('active', index === activeSuggestionIndex);
    });
  }

  function onDocumentClick(event) {
    if (!event.target.closest('.add-city')) {
      hideSuggestions();
    }
  }

  // ---- Cities ----

  function addCity(timezone) {
    if (!window.helpers.isValidTimezone(timezone)) return;
    if (cities.includes(timezone)) {
      searchInput.value = '';
      hideSuggestions();
      return;
    }

    cities.push(timezone);
    saveCities();
    render();

    searchInput.value = '';
    hideSuggestions();
    searchInput.focus();
  }

  function removeCity(timezone) {
    cities = cities.filter((tz) => tz !== timezone);
    saveCities();
    render();
  }

  // ---- Rendering ----

  function render() {
    clockList.innerHTML = '';

    if (cities.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    cities.forEach((timezone) => {
      const card = cardTemplate.content.firstElementChild.cloneNode(true);
      card.dataset.timezone = timezone;
      card.querySelector('.city-name').textContent = window.helpers.getShortCityName(timezone);
      card.querySelector('.remove-btn').addEventListener('click', () => removeCity(timezone));
      clockList.appendChild(card);
    });

    tick();
  }

  function tick() {
    const now = new Date();
    document.querySelectorAll('.clock-card').forEach((card) => {
      const timezone = card.dataset.timezone;
      card.querySelector('.time').textContent = window.helpers.formatTimeInZone(now, timezone);
      card.querySelector('.date').textContent = window.helpers.formatDateInZone(now, timezone);
    });
  }
})();
