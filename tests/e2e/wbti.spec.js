/**
 * Purpose: Playwright smoke for WBTI happy path.
 */
import { test, expect } from '@playwright/test';

test('completes quiz and shows result title', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /测测你的.*牛马.*格/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: '开始测试' }).click();
  for (let i = 0; i < 16; i += 1) {
    await page.locator('.option-btn').first().click();
    const next = page.getByRole('button', {
      name: i === 15 ? '查看结果' : '下一题',
    });
    await next.click();
  }
  await expect(page.locator('#result-title')).toBeVisible();
  const title = await page.locator('#result-title').textContent();
  expect(title && title.trim().length).toBeGreaterThan(0);
  const portrait = page.locator('#result-portrait');
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('data-type-key', /^[+-]{3}$/);
  await expect(portrait).toHaveAttribute(
    'alt',
    /角色插画：/,
  );
  await expect(portrait).toHaveAttribute(
    'src',
    /profiles\/profile[+-]{3}\.png$/,
  );
  await expect(page.locator('#result-subtitle')).toBeVisible();
  const sub = await page.locator('#result-subtitle').textContent();
  expect(sub && sub.includes('稀有度')).toBe(true);
  await expect(page.locator('.result-card .disclaimer')).toContainText('招聘');
  await expect(page.locator('.result-card .disclaimer')).toContainText('诊断');
});

test('retake returns to welcome', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '开始测试' }).click();
  for (let i = 0; i < 16; i += 1) {
    await page.locator('.option-btn').nth(1).click();
    await page
      .getByRole('button', { name: i === 15 ? '查看结果' : '下一题' })
      .click();
  }
  await page.getByRole('button', { name: '再测一次' }).click();
  await expect(page.getByRole('button', { name: '开始测试' })).toBeVisible();
});
