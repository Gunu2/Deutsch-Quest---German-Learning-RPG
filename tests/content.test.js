import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, cefrLevels, getLevelForXP } from '../src/content.js';

const languageKeys = ['id', 'en', 'de', 'es'];

test('all CEFR levels have starter lessons', () => {
  for (const level of cefrLevels) {
    assert.ok(Array.isArray(lessons[level.id]), `${level.id} lesson bank exists`);
    assert.ok(lessons[level.id].length >= 6, `${level.id} has at least six distinct lessons`);
  }
});

test('each lesson has unique id, translated prompt, options and explanation', () => {
  const ids = new Set();
  for (const level of cefrLevels) for (const lesson of lessons[level.id]) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id ${lesson.id}`);
    ids.add(lesson.id);
    for (const lang of languageKeys) {
      assert.ok(lesson.prompt[lang], `${lesson.id} prompt missing ${lang}`);
      assert.ok(lesson.explanation[lang], `${lesson.id} explanation missing ${lang}`);
    }
    assert.equal(lesson.options.length, 3);
    assert.equal(lesson.options.filter((option) => option.correct).length, 1);
    for (const option of lesson.options) for (const lang of languageKeys) assert.ok(option.label[lang]);
  }
});

test('XP progression unlocks CEFR levels in order', () => {
  assert.equal(getLevelForXP(0), 'A1');
  assert.equal(getLevelForXP(60), 'A2');
  assert.equal(getLevelForXP(120), 'B1');
  assert.equal(getLevelForXP(180), 'B2');
  assert.equal(getLevelForXP(240), 'C1');
  assert.equal(getLevelForXP(300), 'C2');
});
