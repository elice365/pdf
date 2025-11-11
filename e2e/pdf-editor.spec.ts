import { expect, test } from "@playwright/test";

test.describe("PDF Editor 기능 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // PDF 에디터 페이지로 이동
    await page.goto("http://localhost:3000");

    // 테스트용 PDF 파일 업로드 대기 (실제 구현에서는 파일 업로드 필요)
    await page.waitForTimeout(1000);
  });

  test("1. 삭제 후 Undo/Redo 기능", async ({ page }) => {
    // 도형 도구 선택
    await page.click('button[title="도형"]');

    // 사각형 선택
    await page.click('button[title="사각형"]');

    // 캔버스에 도형 그리기 (드래그)
    const canvas = page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 선택 도구로 전환
    await page.click('button[title="선택"]');

    // 생성된 도형 선택
    await canvas.click({ position: { x: 150, y: 150 } });

    await page.waitForTimeout(500);

    // 삭제 버튼 클릭 또는 Delete 키 누르기
    await page.keyboard.press("Delete");

    await page.waitForTimeout(500);

    // Undo (Ctrl+Z)
    await page.keyboard.press("Control+z");

    await page.waitForTimeout(500);

    // 도형이 다시 나타나는지 확인 (캔버스에 객체가 있는지)
    // 실제로는 Redux 상태나 DOM을 확인해야 함

    // Redo (Ctrl+Shift+Z)
    await page.keyboard.press("Control+Shift+z");

    await page.waitForTimeout(500);

    // 도형이 다시 사라지는지 확인
  });

  test("2. PropertiesPanel에서 X, Y, Width, Height 편집", async ({ page }) => {
    // 도형 도구 선택
    await page.click('button[title="도형"]');

    // 사각형 선택
    await page.click('button[title="사각형"]');

    // 캔버스에 도형 그리기
    const canvas = page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 선택 도구로 전환
    await page.click('button[title="선택"]');

    // 생성된 도형 선택
    await canvas.click({ position: { x: 150, y: 150 } });

    await page.waitForTimeout(500);

    // PropertiesPanel이 표시되는지 확인
    const propertiesPanel = page.locator('div:has-text("속성")').first();
    await expect(propertiesPanel).toBeVisible();

    // X 좌표 입력 필드 찾기 및 값 변경
    const xInput = page
      .locator('input[type="number"]')
      .filter({ has: page.locator('label:has-text("X")') })
      .first();
    await xInput.fill("150");
    await xInput.press("Enter");

    await page.waitForTimeout(500);

    // Y 좌표 입력 필드 찾기 및 값 변경
    const yInput = page
      .locator('label:has-text("Y")')
      .locator("..")
      .locator('input[type="number"]');
    await yInput.fill("150");
    await yInput.press("Enter");

    await page.waitForTimeout(500);

    // Width 입력 필드 찾기 및 값 변경
    const widthInput = page
      .locator('label:has-text("너비")')
      .locator("..")
      .locator('input[type="number"]');
    await widthInput.fill("120");
    await widthInput.press("Enter");

    await page.waitForTimeout(500);

    // Height 입력 필드 찾기 및 값 변경
    const heightInput = page
      .locator('label:has-text("높이")')
      .locator("..")
      .locator('input[type="number"]');
    await heightInput.fill("120");
    await heightInput.press("Enter");

    await page.waitForTimeout(500);

    // 변경된 값이 적용되었는지 확인
    await expect(xInput).toHaveValue("150");
    await expect(yInput).toHaveValue("150");
    await expect(widthInput).toHaveValue("120");
    await expect(heightInput).toHaveValue("120");
  });

  test("3. strokeWidth 슬라이더 기능", async ({ page }) => {
    // 도형 도구 선택
    await page.click('button[title="도형"]');

    // 사각형 선택
    await page.click('button[title="사각형"]');

    // 캔버스에 도형 그리기
    const canvas = page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 선택 도구로 전환
    await page.click('button[title="선택"]');

    // 생성된 도형 선택
    await canvas.click({ position: { x: 150, y: 150 } });

    await page.waitForTimeout(500);

    // PropertiesPanel에서 도형 속성 확인
    const shapeProperties = page.locator('h4:has-text("도형 속성")');
    await expect(shapeProperties).toBeVisible();

    // 선 굵기 슬라이더 찾기
    const strokeWidthSlider = page
      .locator('label:has-text("선 굵기")')
      .locator("..")
      .locator('input[type="range"]');
    await expect(strokeWidthSlider).toBeVisible();

    // 슬라이더 값 변경 (10px로)
    await strokeWidthSlider.fill("10");

    await page.waitForTimeout(500);

    // number 입력 필드에도 10이 표시되는지 확인
    const strokeWidthNumber = page
      .locator('label:has-text("선 굵기")')
      .locator("..")
      .locator('input[type="number"]');
    await expect(strokeWidthNumber).toHaveValue("10");

    // number 입력 필드로도 변경 가능한지 테스트
    await strokeWidthNumber.fill("15");
    await strokeWidthNumber.press("Enter");

    await page.waitForTimeout(500);

    // 슬라이더 값도 15로 변경되었는지 확인
    await expect(strokeWidthSlider).toHaveValue("15");
  });

  test("4. 색상 변경 기능", async ({ page }) => {
    // 도형 도구 선택
    await page.click('button[title="도형"]');

    // 사각형 선택
    await page.click('button[title="사각형"]');

    // 캔버스에 도형 그리기
    const canvas = page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 선택 도구로 전환
    await page.click('button[title="선택"]');

    // 생성된 도형 선택
    await canvas.click({ position: { x: 150, y: 150 } });

    await page.waitForTimeout(500);

    // 테두리 색상 버튼 클릭
    const strokeColorButton = page
      .locator('label:has-text("테두리 색상")')
      .locator("..")
      .locator("button");
    await strokeColorButton.click();

    await page.waitForTimeout(500);

    // ChromePicker가 표시되는지 확인
    const colorPicker = page.locator(".chrome-picker");
    await expect(colorPicker).toBeVisible();

    // 닫기 (배경 클릭)
    await page.locator("body").click({ position: { x: 0, y: 0 } });

    await page.waitForTimeout(500);

    // ChromePicker가 사라졌는지 확인
    await expect(colorPicker).not.toBeVisible();
  });

  test("5. 레이어 순서 조정 기능", async ({ page }) => {
    // 첫 번째 도형 그리기
    await page.click('button[title="도형"]');
    await page.click('button[title="사각형"]');

    const canvas = page.locator("canvas").first();
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 두 번째 도형 그리기
    await canvas.click({ position: { x: 120, y: 120 } });
    await page.mouse.down();
    await page.mouse.move(170, 170);
    await page.mouse.up();

    await page.waitForTimeout(500);

    // 선택 도구로 전환
    await page.click('button[title="선택"]');

    // 첫 번째 도형 선택
    await canvas.click({ position: { x: 110, y: 110 } });

    await page.waitForTimeout(500);

    // 레이어 순서 버튼 확인
    const bringToFrontButton = page.locator('button[title="맨 앞으로"]');
    const sendToBackButton = page.locator('button[title="맨 뒤로"]');

    await expect(bringToFrontButton).toBeVisible();
    await expect(sendToBackButton).toBeVisible();

    // 맨 앞으로 버튼 클릭
    await bringToFrontButton.click();

    await page.waitForTimeout(500);

    // 맨 뒤로 버튼 클릭
    await sendToBackButton.click();

    await page.waitForTimeout(500);
  });
});
