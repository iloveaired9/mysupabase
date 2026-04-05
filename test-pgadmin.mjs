import { chromium } from '@playwright/test';

async function testPgAdmin() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 pgAdmin 접속 중...');
    await page.goto('http://localhost:5050', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('📸 페이지 스크린샷 저장...');
    await page.screenshot({ path: 'pgadmin-login.png' });

    console.log('✅ 페이지 로드 성공');
    console.log(`📄 페이지 제목: ${await page.title()}`);
    console.log(`📝 페이지 URL: ${page.url()}`);

    // 페이지 내용 확인
    const bodyText = await page.textContent('body');
    if (bodyText) {
      console.log('\n📋 페이지 콘텐츠 (처음 500자):');
      console.log(bodyText.substring(0, 500));
    }

    // 에러 메시지 확인
    const errorElements = await page.$$eval('*', (elements) => {
      return elements
        .filter(el => el.textContent && el.textContent.toLowerCase().includes('error'))
        .map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 200)
        }));
    });

    if (errorElements.length > 0) {
      console.log('\n❌ 감지된 에러:');
      errorElements.forEach((err, i) => {
        console.log(`${i + 1}. [${err.tag}] ${err.text}`);
      });
    }

    // 입력 필드 확인
    console.log('\n🔍 페이지의 입력 필드:');
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      console.log(`   - Type: ${type}, Name: ${name}, ID: ${id}`);
    }

    // 로그인 시도
    console.log('\n🔐 로그인 시도 중...');

    // 이메일 입력
    const emailInput = await page.$('input[type="email"], input[name*="email"], input[name*="user"]');
    if (emailInput) {
      await emailInput.fill('admin@example.com');
      console.log('✓ 이메일 입력');
    } else {
      console.log('⚠️  이메일 입력 필드를 찾을 수 없음');
    }

    // 비밀번호 입력
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('admin');
      console.log('✓ 비밀번호 입력');
    } else {
      console.log('⚠️  비밀번호 입력 필드를 찾을 수 없음');
    }

    // 로그인 버튼 클릭
    const loginButton = await page.$('button[type="submit"], button:has-text("Login")');
    if (loginButton) {
      console.log('✓ 로그인 버튼 클릭');
      await loginButton.click();

      // 페이지 로드 대기
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {
        console.log('⚠️  네비게이션 타임아웃 (계속 진행)');
      });

      await page.screenshot({ path: 'pgadmin-after-login.png' });
      console.log('✓ 로그인 후 스크린샷 저장');
    } else {
      console.log('⚠️  로그인 버튼을 찾을 수 없음');
    }

    // 최종 URL 확인
    console.log(`\n📍 최종 URL: ${page.url()}`);

    // 모든 에러 로그 확인
    console.log('\n📌 콘솔 에러:');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`   ERROR: ${msg.text()}`);
      }
    });

    page.on('requestfailed', request => {
      console.log(`   FAILED: ${request.url()}`);
    });

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    await page.screenshot({ path: 'pgadmin-error.png' });
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료');
  }
}

testPgAdmin();
