const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

const STORAGE_KEY = "pocketzot_note";

function setStatus(message) {
  status.textContent = message;
  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (status.textContent === message) {
      status.textContent = "";
    }
  }, 1800);
}

async function loadNote() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  noteInput.value = stored[STORAGE_KEY] ?? "";
}

async function saveNote() {
  const value = noteInput.value.trim();
  await chrome.storage.local.set({ [STORAGE_KEY]: value });
  setStatus("Saved");
}

saveBtn.addEventListener("click", () => {
  void saveNote();
});

document.addEventListener("DOMContentLoaded", () => {
  void loadNote();
});
