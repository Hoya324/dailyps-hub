# DailyPS Hub

리트코드·프로그래머스의 통과 코드를 `Hoya324/DailyPS`에 저장하는 개인용 Chrome Manifest V3 확장입니다. 기본 설치 대상은 `extension/` 폴더입니다.

## 설치

[한국어 설치 안내](INSTALL.md)를 따라 `extension/` 폴더를 Chrome에 등록하세요. 기본 풀이 저장소는 `Hoya324/DailyPS`입니다. 이 저장소는 확장 프로그램 소스이며 풀이 저장소와 별개입니다.

## 구성
- `extension/lib/capture.js`: 실제 제출 코드 스냅샷과 결과를 연결하는 순수 어댑터
- `extension/bridge.js`: MAIN world에서 LeetCode fetch/XHR, Programmers ActionCable WebSocket 관찰
- `extension/relay.js`: 출처 확인·크기/빈도 제한 후 격리 컨텍스트로 전달
- `extension/lib/core.js`: 목적지·언어·문제 주소 검증, 파일 생성, Git blob 해시
- `extension/lib/github.js`: 코드+README의 원자적 커밋, 비강제 ref 업데이트, 충돌 재시도
- `extension/lib/queue.js`, `extension/background.js`: 신뢰 컨텍스트 전용 저장소·대기열·재시도
- `extension/popup.html`, `extension/options.html`: 한국어 팝업과 연결 설정

토큰과 대기 코드는 Chrome storage.local에 저장합니다. content script 접근을 TRUSTED_CONTEXTS로 제한합니다. 페이지 브리지는 GitHub 토큰을 받지 않습니다. 원격 코드나 외부 UI 라이브러리를 실행하지 않습니다. 문제 페이지 자체가 제공하는 결과를 관찰하는 도구이므로 사이트의 신뢰성과 통신 형식에 의존하며 서버 수준의 채점 증명 도구가 아닙니다.

## 테스트
Node.js 22 이상에서 의존성 설치 없이:

```sh
npm test
```

브라우저 통합 테스트는 Playwright와 Chromium이 필요합니다.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/browser-smoke.cjs
```

브라우저 테스트는 별도 프로필과 모의 사이트·모의 GitHub API를 사용합니다. 실제 저장소에는 쓰지 않습니다. 테스트 코드는 사용 중인 Chrome 프로필에 연결하지 않습니다.

## 알려진 범위
일반 단일 파일 문제만 지원합니다. 사이트가 내부 프로토콜을 변경하면 어댑터 수정이 필요합니다. 설치 전 제출을 수집하지 않습니다. 빈 저장소는 README로 먼저 초기화하세요. 브랜치 보호·조직 정책에 따라 직접 커밋이 제한될 수 있습니다. 실제 로그인된 계정의 제출 및 실제 저장소 업로드는 사용자가 토큰을 연결한 후 확인해야 합니다.

프로그래머스 제출 식별자는 로컬 생성 ID입니다. LeetCode는 화면에서 공개 문제 번호를 읽고, 없으면 제출 요청의 question_id를 사용합니다. 이런 경우 폴더 번호가 사이트 공개 번호와 다를 수 있습니다.

## 프로토콜 조사 참고
- Chrome content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- GitHub Git database API: https://docs.github.com/en/rest/git
- 프로그래머스 공개 문제 페이지와 배포 스크립트 (2026-10-19 확인): https://school.programmers.co.kr/learn/courses/30/lessons/150370
- 공개 확장 구조 참고: https://github.com/BaekjoonHub/BaekjoonHub

배포 코드와 UI는 이 작업에서 새로 작성했습니다. BaekjoonHub 자체 또는 공식 제휴 제품이 아닙니다.
