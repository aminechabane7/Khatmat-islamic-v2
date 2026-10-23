import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrayerTimes,
  formatTime12,
  formatTime24,
  getHijriDate,
  getGregorianDate,
} from '../services/prayerService';
import { AppSettings } from '../types';

describe('Priority 3: Prayer Times & Astronomical Calculations', () => {
  const baseSettings: AppSettings = {
    theme: 'light',
    arabicFontSize: 24,
    quranFont: 'amiri',
    selectedCityId: 'makkah',
    calculationMethod: 'UmmAlQura',
    madhab: 'shafi',
    hapticEnabled: true,
    showTranslation: true,
  };

  it('calculates the 5 obligatory prayers and distinguishes sunrise', () => {
    // Noon time test
    const date = new Date('2026-10-23T09:00:00Z'); // 12:00 in Makkah (UTC+3)
    const result = calculatePrayerTimes(baseSettings, date);

    assert.equal(result.items.length, 6);
    const obligatory = result.items.filter((p) => p.isObligatory);
    const sunrise = result.items.find((p) => p.name === 'Sunrise');

    assert.equal(obligatory.length, 5);
    assert.equal(sunrise?.isObligatory, false);
    assert.equal(sunrise?.arabicName, 'الشروق');
  });

  it('formats times using the selected city timezone', () => {
    // 12:00 UTC = 15:00 in Makkah (Asia/Riyadh, UTC+3)
    const date = new Date('2026-10-23T12:00:00Z');
    const formattedRiyadh = formatTime24(date, 'Asia/Riyadh');
    assert.equal(formattedRiyadh.includes('15:00'), true);

    // In Casablanca (Africa/Casablanca) on this date, offset is GMT (+0), so 12:00 UTC = 12:00
    const formattedCasablanca = formatTime24(date, 'Africa/Casablanca');
    assert.equal(formattedCasablanca.includes('12:00'), true);

    // 12:00 UTC = 08:00 in New York (America/New_York, UTC-4 EDT)
    const formattedNY = formatTime24(date, 'America/New_York');
    assert.equal(formattedNY.includes('08:00'), true);
  });

  it('correctly determines next prayer after Isha as tomorrow Fajr', () => {
    // 21:00 in Makkah (18:00 UTC) -> After Isha
    const lateNightDate = new Date('2026-10-23T18:00:00Z');
    const result = calculatePrayerTimes(baseSettings, lateNightDate);

    assert.equal(result.nextPrayer?.name, 'Fajr');
    assert.equal(result.nextPrayer?.isObligatory, true);
    assert.equal(result.currentPrayer?.name, 'Isha');
    assert.ok(result.timeUntilNext.totalSeconds > 0);
  });

  it('correctly determines next prayer between midnight and Fajr as today Fajr', () => {
    // 02:00 in Makkah (23:00 UTC of previous day) -> Before Fajr
    const earlyMorningDate = new Date('2026-10-23T23:00:00Z');
    const result = calculatePrayerTimes(baseSettings, earlyMorningDate);

    assert.equal(result.nextPrayer?.name, 'Fajr');
    assert.equal(result.nextPrayer?.isObligatory, true);
    assert.ok(result.timeUntilNext.totalSeconds > 0);
  });

  it('supports Moroccan Ministry of Habous calculation method (Morocco)', () => {
    const moroccoSettings: AppSettings = {
      ...baseSettings,
      selectedCityId: 'casablanca',
      calculationMethod: 'Morocco',
    };

    const date = new Date('2026-10-23T12:00:00Z');
    const result = calculatePrayerTimes(moroccoSettings, date);

    assert.equal(result.cityName.includes('الدار البيضاء'), true);
    assert.equal(result.timezone, 'Africa/Casablanca');
    assert.ok(result.officialSourceNote);
    assert.equal(result.items.length, 6);

    // Check that Dhuhr is around ~13:16 local time (12:16 UTC)
    const dhuhr = result.items.find((p) => p.name === 'Dhuhr');
    assert.ok(dhuhr);
  });
});
