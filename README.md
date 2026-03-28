# OnFit School Uniform App

온핏 교복 관리 시스템 (OnFit School Uniform Management System)

## 프로젝트 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 결과를 확인할 수 있습니다.

## 테스트 계정 정보

프로젝트의 각 사용자 그룹(Role)에 따른 권한을 테스트하기 위한 계정 정보입니다.

### 1. 관리자 계정 (Admin Role)
- **ID (Email):** `admin@onfit.com`
- **PW:** `admin1234`
- **특징:** 모든 메뉴 접근 및 시스템 관리 권한

### 2. 파트너사 계정 (Partner Role)
- **ID (Email):** `partner@onfit.com`
- **PW:** `user1234`
- **특징:** 대시보드, 학교/학생 등록 및 관리, 치수 측정 결과 조회 및 발송 권한

### 3. 학생 (Student Role)
- **특징:** 별도의 로그인 없이 전달받은 고유 링크(Token)를 통해서만 자기 자신의 치수 정보 입력 페이지에 접근 가능합니다.

---

[http://localhost:3000](http://localhost:3000)에서 각 계정으로 로그인하여 동작을 확인할 수 있습니다.