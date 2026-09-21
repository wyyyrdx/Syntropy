import { test, expect } from '@playwright/test';

test('verify 2d realm and class books interactions', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // 1. Switch to 2D Realm
  await page.click('button:has-text("2D REALM")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/sumitmishra/.gemini/antigravity-ide/brain/e8f771f2-16c7-4d0c-9a5e-c3fd7329c690/arka_interaction_realm.png' });

  // 2. Switch to Class Books
  await page.click('button:has-text("CLASS BOOKS")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/sumitmishra/.gemini/antigravity-ide/brain/e8f771f2-16c7-4d0c-9a5e-c3fd7329c690/arka_interaction_books.png' });

  // 3. Open Chapter Quiz
  await page.click('button:has-text("START CHAPTER QUIZ")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/Users/sumitmishra/.gemini/antigravity-ide/brain/e8f771f2-16c7-4d0c-9a5e-c3fd7329c690/arka_interaction_quiz.png' });
});
