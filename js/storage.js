/* ─────────────────────────────────────────────────────────────
   MoodHand Local Persistence & History Archive
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'mood_history_records';

export function saveCardToHistory(record) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = list.filter(item => item.seed !== record.seed);
    filtered.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 15)));
  } catch (e) {}
}

export function getHistoryRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
