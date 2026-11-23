(() => {
  const form = document.querySelector("#booking-form");
  const success = document.querySelector("#booking-success");
  if (!form) return;

  const nextField = document.querySelector("#booking-next");
  if (nextField) {
    const url = new URL(window.location.href);
    url.searchParams.set("sent", "1");
    nextField.value = url.toString().split("#")[0];
  }

  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    form.hidden = true;
    if (success) success.hidden = false;
    return;
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const labelEl = document.querySelector("[data-cal-label]");
  const gridEl = document.querySelector("[data-cal-grid]");
  const listEl = document.querySelector("[data-selected-list]");
  const datesInput = document.querySelector("#requested-dates");
  const datesError = document.querySelector("[data-dates-error]");
  const prevBtn = document.querySelector("[data-cal-prev]");
  const nextBtn = document.querySelector("[data-cal-next]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  const selected = new Set();

  const toKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplay = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const syncDatesField = () => {
    const sorted = [...selected].sort();
    datesInput.value = sorted.join(", ");
    if (datesError) datesError.hidden = sorted.length > 0 || datesError.dataset.touched !== "1";

    if (!listEl) return;
    listEl.innerHTML = "";

    if (!sorted.length) {
      const empty = document.createElement("li");
      empty.className = "selected-dates-empty";
      empty.textContent = "No dates selected yet";
      listEl.appendChild(empty);
      return;
    }

    sorted.forEach((key) => {
      const li = document.createElement("li");
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "date-chip";
      chip.setAttribute("aria-label", `Remove ${formatDisplay(key)}`);
      chip.innerHTML = `<span>${formatDisplay(key)}</span><span aria-hidden="true">×</span>`;
      chip.addEventListener("click", () => {
        selected.delete(key);
        syncDatesField();
        renderCalendar();
      });
      li.appendChild(chip);
      listEl.appendChild(li);
    });
  };

  const renderCalendar = () => {
    if (!labelEl || !gridEl) return;
    labelEl.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    gridEl.innerHTML = "";

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startPad = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startPad; i += 1) {
      const pad = document.createElement("span");
      pad.className = "calendar-day is-pad";
      pad.setAttribute("aria-hidden", "true");
      gridEl.appendChild(pad);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(viewYear, viewMonth, day);
      const key = toKey(date);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      btn.textContent = String(day);
      btn.setAttribute("role", "gridcell");

      const isPast = date < today;
      if (isPast) {
        btn.disabled = true;
        btn.classList.add("is-disabled");
      }

      if (key === toKey(today)) btn.classList.add("is-today");
      if (selected.has(key)) {
        btn.classList.add("is-selected");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }

      if (!isPast) {
        btn.addEventListener("click", () => {
          if (selected.has(key)) selected.delete(key);
          else selected.add(key);
          syncDatesField();
          renderCalendar();
        });
      }

      gridEl.appendChild(btn);
    }
  };

  prevBtn?.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });

  nextBtn?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });

  form.addEventListener("submit", (event) => {
    if (!selected.size) {
      event.preventDefault();
      if (datesError) {
        datesError.dataset.touched = "1";
        datesError.hidden = false;
      }
      document.querySelector(".booking-calendar-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    syncDatesField();
  });

  syncDatesField();
  renderCalendar();
})();
