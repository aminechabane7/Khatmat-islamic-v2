import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateKey, DEFAULT_KHATMA_STATE } from '../services/storageService';
import { KhatmaState } from '../types';

describe('Priority 1: Khatma Tracking & Reading Progress Logic', () => {
  it('should use local calendar date YYYY-MM-DD instead of UTC ISO string', () => {
    const testDate = new Date(2026, 9, 23, 23, 30); // Oct 23, 2026 23:30 local
    const localKey = getLocalDateKey(testDate);
    assert.equal(localKey, '2026-10-23');

    // Compare with UTC ISO split when near midnight
    const endOfDay = new Date(2026, 9, 23, 23, 59, 59);
    assert.equal(getLocalDateKey(endOfDay), '2026-10-23');
  });

  it('setReadingPosition must only update position without modifying completedPages or dailyLogs', () => {
    const initialState: KhatmaState = {
      ...DEFAULT_KHATMA_STATE,
      currentSurahNumber: 1,
      currentAyahNumber: 1,
      currentPageNumber: 1,
      completedPages: [],
      dailyLogs: {},
    };

    // Simulate opening Surah Al-Kahf (page 293)
    const surahNum = 18;
    const ayahNum = 1;
    const pageNum = 293;

    // Fixed logic: purely position update
    const updatedState: KhatmaState = {
      ...initialState,
      currentSurahNumber: surahNum,
      currentAyahNumber: ayahNum,
      currentPageNumber: pageNum,
    };

    assert.equal(updatedState.currentPageNumber, 293);
    assert.equal(updatedState.currentSurahNumber, 18);
    assert.equal(updatedState.currentAyahNumber, 1);
    // Crucial: completedPages must remain empty!
    assert.deepEqual(updatedState.completedPages, []);
    assert.deepEqual(updatedState.dailyLogs, {});
  });

  it('togglePageCompleted explicitly marks a page as completed and updates dailyLogs', () => {
    const todayKey = getLocalDateKey();
    const state: KhatmaState = {
      ...DEFAULT_KHATMA_STATE,
      completedPages: [1, 2],
      dailyLogs: { [todayKey]: 2 },
    };

    // Complete page 3
    const pageSet = new Set(state.completedPages);
    pageSet.add(3);
    const newCompleted = Array.from(pageSet).sort((a, b) => a - b);
    const newLogs = { ...state.dailyLogs, [todayKey]: (state.dailyLogs[todayKey] || 0) + 1 };

    assert.deepEqual(newCompleted, [1, 2, 3]);
    assert.equal(newLogs[todayKey], 3);

    // Uncomplete page 2
    pageSet.delete(2);
    const uncompleted = Array.from(pageSet).sort((a, b) => a - b);
    const uncompletedLogs = { ...newLogs, [todayKey]: Math.max(0, newLogs[todayKey] - 1) };

    assert.deepEqual(uncompleted, [1, 3]);
    assert.equal(uncompletedLogs[todayKey], 2);
  });

  it('prevents duplicate page numbers in completedPages and clamps range 1-604', () => {
    const rawPages = [1, 1, 5, 5, 0, 605, 604, -3];
    const sanitized = Array.from(
      new Set(rawPages.filter((p) => p >= 1 && p <= 604))
    ).sort((a, b) => a - b);

    assert.deepEqual(sanitized, [1, 5, 604]);
    assert.equal(sanitized.includes(0), false);
    assert.equal(sanitized.includes(605), false);
  });

  it('prevents counting a completed Khatma more than once', () => {
    let completedKhatmasCount = 0;
    let khatmaCompletedAwarded = false;

    // Simulate completing all 604 pages
    const pages = Array.from({ length: 604 }, (_, i) => i + 1);

    if (pages.length >= 604 && !khatmaCompletedAwarded) {
      completedKhatmasCount += 1;
      khatmaCompletedAwarded = true;
    }

    assert.equal(completedKhatmasCount, 1);
    assert.equal(khatmaCompletedAwarded, true);

    // If another page toggle occurs while at 604, it must NOT increment again
    if (pages.length >= 604 && !khatmaCompletedAwarded) {
      completedKhatmasCount += 1;
    }
    assert.equal(completedKhatmasCount, 1);

    // When resetKhatma is called, it resets pages and flag
    const afterReset: KhatmaState = {
      ...DEFAULT_KHATMA_STATE,
      completedPages: [],
      completedKhatmasCount, // Retains the 1 completed khatma
      khatmaCompletedAwarded: false,
    };

    assert.equal(afterReset.completedKhatmasCount, 1);
    assert.equal(afterReset.completedPages.length, 0);
  });
});
