# 펜션플러스 요금제 관리 시스템

펜션플러스 다중 객실 요금 설정 시스템을 React로 구현한 프로젝트입니다.

## 🚀 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

## 📋 기능

### Phase 1: 완료된 기능 ✅

- ✅ React + TypeScript + Vite 프로젝트 설정
- ✅ Tailwind CSS 스타일링 시스템 구축
- ✅ TypeScript 타입 시스템 정의
- ✅ 샘플 데이터 (온다 펜션 기준)
- ✅ Context API 기반 상태 관리
- ✅ 레이아웃 및 공통 컴포넌트
- ✅ **요금 전체보기** 페이지
  - 월간 캘린더 뷰
  - 일자별 최저/최고/평균 가격 표시
  - 시즌 정보 표시
  - 날짜 클릭 시 상세 요금 정보
  - 객실별 요금 및 인원추가 요금 확인

### Phase 2: 진행 예정 🔄

- ⏳ **요금 개요** 페이지
  - 연간 시즌 타임라인
  - 객실 요금 설정표
  - 채널별 필터

- ⏳ **빠른 설정** 기능
  - 프리셋 기반 요금 설정
  - 요금 변경 미리보기

- ⏳ **기본 요금 설정** 페이지
  - 시즌별 요금 관리
  - 시즌 추가/수정/삭제

- ⏳ **대량 수정** 기능
  - 엑셀 스타일 편집

## 🏗 프로젝트 구조

```
src/
├── components/
│   ├── calendar/       # 캘린더 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Badge, Card)
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── pricing/        # 요금 관련 컴포넌트
│   ├── room/           # 객실 관련 컴포넌트
│   ├── season/         # 시즌 관련 컴포넌트
│   └── modals/         # 모달 컴포넌트
├── contexts/           # Context API 상태 관리
├── pages/              # 페이지 컴포넌트
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
├── constants/          # 상수 정의
└── services/           # 서비스 및 목 데이터
```

## 💡 주요 기술 스택

- **Frontend**: React 18 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Context API + useReducer
- **아이콘**: Lucide React
- **날짜 처리**: date-fns

## 📝 요금 구조

### 채널 구분
- 예약창 요금
- 온라인채널 요금

### 시즌 구분
- 기본 요금 (비수기)
- 준성수기
- 성수기
- 극성수기

### 요일 구분
- 주중 (월~목)
- 금요일
- 토요일 (공휴일 전날)
- 일요일

### 인원추가 요금
- 성인
- 아동
- 유아

## 🎯 요금 적용 규칙

1. **수동 설정된 날짜** → 최우선 적용
2. **시즌 기간 내 날짜** → 시즌 요금 적용 (우선순위: 높음 > 중 > 낮음)
3. **그 외 모든 날짜** → 기본 요금 적용

## 📊 샘플 데이터 (온다 펜션)

- **총 객실**: 20개
  - 스탠다드 객실 10개 (예약창만 판매)
  - 독채 타입 객실 10개 (예약창 + 온라인채널)

## 🔧 개발 가이드

### 새 페이지 추가
1. `src/pages/`에 새 페이지 컴포넌트 생성
2. `src/components/layout/TabNavigation.tsx`에 탭 추가
3. `src/App.tsx`의 `renderContent`에 라우팅 추가

### 상태 업데이트
`src/contexts/PricingContext.tsx`의 reducer에 새 액션 추가

## 📄 라이선스

MIT

## 👥 개발자

펜션플러스 개발팀
