# 검증 결과 — 2026-10-19

- Node 단위 테스트 18개 통과: 코드 스냅샷, 제출 결과 연결, 오답/실행 제외, 겹친 제출 차단, 경로 검증, UTF-8 Git 해시, 원자적 커밋, 충돌 재시도, 원격 코드 중복 생략, 대기열 지속 상태, 목적지 고정, 릴레이 출처 필터.
- 실제 Chromium에 Manifest V3 확장을 로드한 통합 테스트 통과: 설정 저장, 팝업, 리트코드 fetch 제출/결과 감지, 프로그래머스 WebSocket 제출/결과 감지, 백그라운드 GitHub API 호출까지 검증.
- 통합 테스트의 사이트 응답과 GitHub API는 모의 응답이다. 사용자 계정·실제 저장소는 변경하지 않았다.
- 모든 extension JavaScript 문법 검사 통과.
- manifest의 참조 파일 존재, ZIP 무결성 검사 통과.
- 팝업 스크린샷을 확인함. 연결 상태는 테스트용 가상 연결이다.

미검증: 실제 로그인 사이트에서 제출, 실제 토큰으로 Hoya324/DailyPS 커밋, Java 이외 각 언어의 실사이트 제출. 첫 실제 통과 제출로 확인할 것.

## 1.0.1 수정
기본 fetch를 객체 메서드로 호출하면서 발생한 WorkerGlobalScope Illegal invocation 수정. 기본 요청 함수를 전역 fetch 래퍼로 교체. 기본 receiver 단위 테스트와 실제 Service Worker fetch 회귀 검증 추가. 사용자 토큰을 읽지 않고 data URL로 브라우저 동작을 검증함.

## 1.0.3 수정
사용자 Network 로그의 /submissions/detail/2176098802/v2/check/ 경로로 누락 재현 후 v2 및 기존 채점 경로 지원. v2 제출 ID 일치, PENDING, 중복 결과, 오답 회귀 테스트 추가. Chrome 통합 테스트도 v2 경로 사용.

## 1.0.4 수정
Chrome에서 history.pushState로 두 번째 문제로 이동 후 저장이 누락되는 현상 재현. sender.url의 최초 문서 경로 대신 격리된 relay가 직접 읽은 현재 location.href로 문제 경로 검증. 원본 문서 및 현재 페이지 출처 일치 검증 유지. 새로고침 없는 연속 두 문제 저장을 브라우저 테스트에 추가.
