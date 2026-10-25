# 페이지 전환 실험실 (1단계: 시안 2·3)

근거: `reports/홈 페이지 전환 애니메이션 레퍼런스.md` (2026-10-25 수정판)

## 목적

홈 → `/archive`·`/news` 이동에 전환 애니메이션 시안을 붙여 실제 페이지에서 비교한다. 1단계는 시안 2(에스프레소 블라인드)와 시안 3(필드 연속)이고, 시안 3은 홈 WebGL 캔버스가 View Transition 스냅샷에 제대로 찍히는지를 검증하는 역할도 한다. 2단계에서 시안 1·4·5를 더한다.

## 범위

- 브랜치 `transition-lab`. main에는 그대로 합치지 않는다. 최종안이 정해지면 그 시안만 다시 옮긴다.
- 전환은 홈의 헤더·푸터에 있는 `아카이브`·`소식` 링크에만 건다(`transitionTypes={['from-home']}`). 서브페이지끼리의 이동, 브라우저 뒤로가기에는 타입이 없어 전환되지 않는다.

## 구조

- **전환 패널** (`src/components/lab/TransitionLab.tsx`, 루트 `layout.tsx`에 마운트): `?lab=1`로 켜고 `?lab=0`으로 끈다. 켜진 상태와 고른 시안은 localStorage에 둔다. 고른 시안은 `<html data-tx="2|3">`로 표시하고, 시안 CSS는 모두 이 속성 아래에만 건다. 속성이 없으면 모든 view transition 애니메이션을 끈다. 이때도 브라우저의 전환 절차 자체는 일어나므로 "끔"은 "애니메이션만 없는 상태"다.
- **React `<ViewTransition>`**: 홈 `page.tsx`에서 `<GrainStage>`를 바깥에서 감싸 exit(`tx-home-out`), `SubPage`의 최상단을 감싸 enter(`tx-sub-in`). 둘 다 `from-home` 타입일 때만 클래스가 붙고 그 외는 `none`.
- **CSS** (`src/app/transition-lab.css`): 시안별 `::view-transition-*` 규칙, reduced-motion 대체.

## 시안

- **2. 에스프레소 블라인드**: 홈 스냅샷이 0.3초(`power2.out`)에 걸쳐 사라져 에스프레소 바닥이 드러나고, 이어서 새 페이지가 아래부터 1.1초(`cubic-bezier(.4,0,0,1)`)에 걸쳐 열린다. 경계는 화면 높이 기준(`inset(100vh 0 0 0)` → `inset(0)`)이다. `%`는 페이지 전체 높이 기준이라 쓰지 않는다.
- **3. 필드 연속**: 홈 `#field`와 서브페이지 `.sub-field`에 같은 이름(`grain-field`)을 줘서 0.4초 동안 잇는다. 콘텐츠는 위치 이동 없이, 홈 쪽은 0.3초 흐려지며 사라지고 새 쪽은 `blur(6px) sepia(.45)`에서 1.1초에 걸쳐 선명해진다. 헤더에는 이름을 주지 않는다. 헤더가 `position: absolute`라 푸터에서 누르면 화면 밖에서 날아 들어오기 때문이다.

## 접근성

`prefers-reduced-motion: reduce`이면 두 시안 모두 200ms opacity 페이드만 남긴다.

## 확인할 가정 (첫 단계에서 화면으로 확인)

1. `cacheComponents`의 Activity 숨김에서도 홈 래퍼의 exit가 발화하는가. 안 되면 root 스냅샷 방식으로 바꾼다.
2. 새 페이지가 스크롤 맨 위에서 시작하는가. 시안 2의 화면 높이 기준 블라인드가 이 가정에 기댄다.
3. `preserveDrawingBuffer` 없는 WebGL 캔버스가 정지 화면으로 제대로 찍히는가(Chrome·Safari·Firefox).

## 검증

자동 테스트는 없다. 빌드·lint 통과, 프로덕션 서버(`next build && next start`)에서 확인한다. dev 서버에서는 prefetch가 꺼져 공유 요소 전환이 재현되지 않으므로 쓰지 않는다.
