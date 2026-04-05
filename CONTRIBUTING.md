# 🤝 기여 가이드

이 프로젝트에 기여해주셔서 감사합니다! 이 문서는 기여 방법을 안내합니다.

## 👥 행동 규칙

이 프로젝트는 다음 가치를 중시합니다:
- 존중과 포용성
- 열린 마음과 협력
- 건설적인 피드백

---

## 🐛 버그 신고

### 버그를 발견했나요?

[GitHub Issues](https://github.com/iloveaired9/mysupabase/issues/new?labels=bug)에서 버그를 신고해주세요.

**버그 신고에 포함할 내용:**

```markdown
## 설명
버그에 대한 명확하고 간결한 설명

## 재현 단계
1. ...
2. ...
3. ...

## 예상 동작
어떻게 되어야 하는지 설명

## 실제 동작
실제로 무엇이 일어났는지 설명

## 환경
- OS: [예: Windows 10, macOS 12, Ubuntu 20.04]
- Docker version: [예: 20.10]
- Node version: [해당하는 경우]
- Browser: [해당하는 경우]

## 추가 정보
스크린샷, 로그, 에러 메시지 등
```

---

## 💡 기능 제안

### 새로운 기능을 제안하고 싶으신가요?

[GitHub Discussions](https://github.com/iloveaired9/mysupabase/discussions/new?category=ideas)에서 제안해주세요.

**기능 제안에 포함할 내용:**

```markdown
## 제안하는 기능
기능에 대한 명확한 설명

## 문제
이 기능으로 해결하려는 문제

## 해결책
제안하는 해결책

## 대안
고려한 다른 대안들

## 추가 정보
관련된 이슈, 링크 등
```

---

## 🔧 코드 기여

### 1. 저장소 Fork하기

```bash
# GitHub 웹사이트에서 Fork 버튼 클릭
https://github.com/iloveaired9/mysupabase/fork
```

### 2. 로컬 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/mysupabase.git
cd mysupabase
git remote add upstream https://github.com/iloveaired9/mysupabase.git
```

### 3. 새 브랜치 생성

```bash
git fetch upstream
git checkout -b feature/your-feature-name upstream/main
```

**브랜치 네이밍 규칙:**
- `feature/` - 새로운 기능
- `fix/` - 버그 수정
- `docs/` - 문서 변경
- `refactor/` - 코드 리팩토링
- `test/` - 테스트 추가

### 4. 변경사항 작업

```bash
# 필요한 변경을 수행하세요
# 규칙을 따라 코드를 작성하세요 (아래 참고)
```

### 5. 변경사항 Commit

```bash
git add .
git commit -m "feat: Add amazing feature"
```

**Commit 메시지 규칙:**
- 명령형으로 작성 (예: "Add" 아닌 "Added")
- 첫 글자는 대문자
- 마침표 없음
- 관련 이슈 링크 (예: `Closes #123`)

**좋은 예:**
```
feat: Add user authentication
fix: Correct API response format
docs: Update installation guide
refactor: Simplify database connection logic
```

### 6. 코드 스타일 확인

프로젝트는 다음 스타일을 따릅니다:

**JavaScript/Node.js:**
```javascript
// ✅ Good
function getUserById(userId) {
  // 명확한 함수명
  const user = database.find(userId);
  return user;
}

// ❌ Bad
function getUserById (userId){
  var u = database.find(userId)
  return u
}
```

**SQL:**
```sql
-- ✅ Good
SELECT id, name, email
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ❌ Bad
select id,name,email from users where created_at>=NOW()-INTERVAL '7 days' order by created_at desc;
```

**CSS:**
```css
/* ✅ Good */
.button-primary {
  background-color: #0066cc;
  padding: 8px 16px;
  border-radius: 4px;
}

/* ❌ Bad */
.btn-p {
  bg: #0066cc;
  p: 8px 16px;
  br: 4px;
}
```

### 7. 변경사항 Push

```bash
git push origin feature/your-feature-name
```

### 8. Pull Request 생성

[GitHub Pull Request](https://github.com/iloveaired9/mysupabase/compare)에서 PR을 생성하세요.

**PR 제목:**
```
feat: Add user authentication system
```

**PR 설명 템플릿:**
```markdown
## 변경사항 설명
어떤 문제를 해결하는지 설명

## 변경사항 타입
- [ ] 버그 수정
- [ ] 새로운 기능
- [ ] 문서 변경
- [ ] 코드 리팩토링
- [ ] 테스트 추가

## 테스트 방법
다음과 같이 테스트할 수 있습니다:
1. ...
2. ...

## 스크린샷 (해당하는 경우)
[이미지 붙여넣기]

## 체크리스트
- [ ] 코드가 프로젝트 스타일을 따릅니다
- [ ] 자체 검토를 완료했습니다
- [ ] 주석을 추가했습니다 (필요한 경우)
- [ ] 문서를 업데이트했습니다
- [ ] 테스트를 수행했습니다
- [ ] 기존 테스트를 깨뜨리지 않습니다

## 관련 이슈
Closes #123
```

---

## 📋 개발 환경 설정

### 필수 요구사항

```bash
# Docker 확인
docker --version

# Node.js (선택사항, 로컬 개발시)
node --version
```

### 개발 환경 시작

```bash
# 저장소 클론
git clone https://github.com/iloveaired9/mysupabase.git
cd mysupabase

# 서비스 시작
docker-compose up -d

# 상태 확인
docker-compose ps
```

### 자주 사용하는 명령어

```bash
# 로그 확인
docker-compose logs -f postgrest

# 특정 서비스 재시작
docker-compose restart swagger-ui

# 데이터베이스 접속
docker exec -it supabase-postgres psql -U supabase -d supabase

# 모든 서비스 중지
docker-compose down
```

---

## 🧪 테스트

### API 테스트

```bash
# cURL로 테스트
curl http://localhost:3001/posts?limit=6

# Swagger UI로 테스트
# 브라우저에서 http://localhost:8080 열기
```

### 데이터베이스 테스트

```bash
# SQL 파일 실행
docker exec -i supabase-postgres psql -U supabase -d supabase < test.sql
```

---

## 📚 문서 작성

### 문서 파일 위치

- **마스터 README**: `README.md`
- **API 가이드**: `docs/API_GUIDE.md`
- **Step별 문서**: `app/step*/README.md`
- **데이터베이스**: `database/README.md`

### 마크다운 스타일

```markdown
# 제목 1
## 제목 2
### 제목 3

**굵은 텍스트**
*기울임 텍스트*
`코드`

- 리스트 항목 1
- 리스트 항목 2

1. 순서가 있는 항목 1
2. 순서가 있는 항목 2

[링크](https://example.com)

\`\`\`javascript
const code = "example";
\`\`\`

> 인용문
```

---

## 🔍 코드 리뷰

### PR 리뷰 과정

1. 자동화된 테스트 실행
2. 코드 리뷰어의 검토
3. 요청사항에 대한 수정
4. 승인 및 병합

### 빠른 병합을 위한 팁

✅ **DO:**
- 작은, 포커스된 PR 만들기
- 명확한 PR 제목과 설명
- 기존 테스트 통과 확인
- 코드 스타일 준수

❌ **DON'T:**
- 많은 파일을 수정하는 큰 PR
- 불명확한 커밋 메시지
- 테스트 없는 코드 변경
- 문서 없는 API 변경

---

## 🆘 도움이 필요한가요?

### 자주 묻는 질문

**Q: 어디서 시작해야 할까요?**
A: [Good First Issue](https://github.com/iloveaired9/mysupabase/issues?q=label:good%20first%20issue)를 확인하세요.

**Q: PR이 오래된 것 같아요.**
A: 댓글을 달아 관심이 있음을 표현하세요. 리뷰어가 응답할 것입니다.

**Q: 어떤 도구를 사용해야 하나요?**
A: Docker, git, 텍스트 에디터(VS Code 추천)만 있으면 됩니다.

### 추가 도움

- [GitHub Issues](https://github.com/iloveaired9/mysupabase/issues)에서 질문하세요
- [GitHub Discussions](https://github.com/iloveaired9/mysupabase/discussions)에서 토론하세요

---

## 📄 라이선스

이 프로젝트에 기여함으로써, 귀하는 MIT 라이선스에 따라 기여 내용을 공개하는 데 동의합니다.

---

감사합니다! 🙏

이 프로젝트를 더 좋게 만들기 위한 여러분의 노력을 높이 평가합니다.
