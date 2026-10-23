import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_SURAHS, TOTAL_AYAHS, TOTAL_PAGES, TOTAL_SURAHS } from '../data/surahs';
import { validateSurahIntegrity } from '../services/quranService';
import { Ayah } from '../types';

describe('Priority 2: Quran Uthmani Integrity & Dataset Validation', () => {
  it('validates Surah metadata count matches 114 Surahs and 6236 total Ayahs', () => {
    assert.equal(ALL_SURAHS.length, TOTAL_SURAHS);
    const sumAyahs = ALL_SURAHS.reduce((acc, s) => acc + s.numberOfAyahs, 0);
    assert.equal(sumAyahs, TOTAL_AYAHS);
  });

  it('validateSurahIntegrity detects valid and invalid surah verse arrays', () => {
    // Valid Al-Fatiha
    const validFatiha: Ayah[] = [
      { number: 1, numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1 },
      { number: 2, numberInSurah: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', page: 1 },
      { number: 3, numberInSurah: 3, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1 },
      { number: 4, numberInSurah: 4, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', page: 1 },
      { number: 5, numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', page: 1 },
      { number: 6, numberInSurah: 6, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', page: 1 },
      { number: 7, numberInSurah: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', page: 1 },
    ];
    const checkValid = validateSurahIntegrity(1, validFatiha);
    assert.equal(checkValid.isValid, true);

    // Invalid: missing an ayah (6 instead of 7)
    const checkMissing = validateSurahIntegrity(1, validFatiha.slice(0, 6));
    assert.equal(checkMissing.isValid, false);
    assert.ok(checkMissing.reason?.includes('لا يطابق'));

    // Invalid: out-of-range page number
    const invalidPageFatiha: Ayah[] = validFatiha.map((a) => ({ ...a, page: 999 }));
    const checkPage = validateSurahIntegrity(1, invalidPageFatiha);
    assert.equal(checkPage.isValid, false);

    // Invalid: empty text
    const emptyTextFatiha: Ayah[] = [{ ...validFatiha[0], text: '' }, ...validFatiha.slice(1)];
    const checkEmpty = validateSurahIntegrity(1, emptyTextFatiha);
    assert.equal(checkEmpty.isValid, false);
  });

  it('validates the complete local verified Quran dataset file (public/data/quran-uthmani.json)', () => {
    const filePath = path.resolve('public/data/quran-uthmani.json');
    assert.ok(fs.existsSync(filePath), 'Quran dataset file must exist in public/data/');

    const raw = fs.readFileSync(filePath, 'utf-8');
    const dataset = JSON.parse(raw);

    assert.equal(Array.isArray(dataset), true);
    assert.equal(dataset.length, 114);

    let totalAyahsCount = 0;
    let minPage = 999;
    let maxPage = 0;

    for (let i = 0; i < dataset.length; i++) {
      const s = dataset[i];
      const expectedMeta = ALL_SURAHS[i];
      assert.equal(s.number, expectedMeta.number);
      assert.equal(s.ayahs.length, expectedMeta.numberOfAyahs);
      totalAyahsCount += s.ayahs.length;

      for (const a of s.ayahs) {
        if (a.page < minPage) minPage = a.page;
        if (a.page > maxPage) maxPage = a.page;
        assert.ok(a.text && a.text.trim().length > 0);
      }
    }

    assert.equal(totalAyahsCount, 6236);
    assert.equal(minPage, 1);
    assert.equal(maxPage, 604);
  });
});
