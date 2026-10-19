# Chrome 웹스토어 제출 가이드 — DailyPS Hub 1.1.0

아직 웹스토어 심사를 제출하지 않았습니다. 아래 문구와 파일을 개발자 대시보드에 입력하세요.

## 업로드 파일

`DailyPS-Hub-webstore-1.1.0.zip`을 업로드합니다. manifest.json이 ZIP 최상위에 있는 웹스토어 전용 패키지입니다. 설치 안내용 ZIP과 혼동하지 마세요.

## 스토어 등록 정보

- 이름: DailyPS Hub
- 언어: 한국어
- 카테고리: Developer Tools (대시보드의 해당 개발 도구 카테고리)
- 짧은 설명: 리트코드·프로그래머스에서 통과한 코드를 사용자가 연결한 GitHub 저장소에 저장합니다.
- 홈페이지: https://github.com/Hoya324/dailyps-hub
- 지원: https://github.com/Hoya324/dailyps-hub/issues
- 개인정보 처리방침: https://github.com/Hoya324/dailyps-hub/blob/main/PRIVACY.md
- 아이콘: assets/icon128.png
- 스크린샷: assets/settings-1280x800.png, assets/popup-1280x800.png
- 작은 홍보 이미지: assets/promo-440x280.png

## 상세 설명 — 복사해서 사용

문제를 풀고 제출하면, 통과한 코드가 내 GitHub에 기록됩니다.

DailyPS Hub는 LeetCode와 프로그래머스에서 전체 통과한 제출을 사용자가 지정한 GitHub 저장소에 저장합니다.

• 코드와 문제 링크·언어·제출 정보를 한 커밋으로 기록
• 저장소·브랜치·폴더 직접 지정
• 동일 코드 중복 커밋 생략
• 실패한 저장을 로컬 대기열에 보관하고 재시도
• 자동 저장 켜기/끄기와 최근 저장 결과 확인

시작하려면 README로 초기화한 GitHub 저장소와 해당 저장소에 Contents: Read and write 권한이 있는 Fine-grained personal access token이 필요합니다. 확장 설정에서 연결한 뒤 열려 있는 문제 페이지를 새로고침하세요. Run/예제 실행은 저장하지 않으며 Submit/제출 후 채점하기의 전체 통과 결과를 저장합니다.

일반 단일 파일 문제를 지원합니다. 과거 제출 일괄 수집, 프로그래머스 빈칸 채우기·다중 파일, 시험·대회 전용 화면, LeetCode.cn은 지원하지 않습니다. Java 중심으로 검증했으며 다른 주요 언어의 파일 확장자 매핑도 제공합니다. 사이트 통신 방식 변경에 따라 업데이트가 필요할 수 있습니다.

토큰과 대기 코드는 현재 Chrome 프로필의 확장 로컬 저장소에 보관됩니다. 토큰은 GitHub 인증에만 사용하며 문제 페이지로 전달하지 않습니다. 운영자 서버나 광고·분석 서비스는 사용하지 않습니다. 공개 저장소를 선택하면 업로드한 코드도 공개됩니다.

LeetCode, 프로그래머스, GitHub의 공식 제품이나 제휴 서비스가 아닙니다.

## Privacy practices 입력

### 단일 목적

LeetCode와 프로그래머스의 정답 제출 코드를 사용자가 지정한 GitHub 저장소에 기록하여 문제 풀이 이력을 관리합니다.

### 권한 사용 사유

- storage: GitHub 연결 설정, 인증 토큰, 실패 제출 대기열 및 최근 저장 결과를 현재 프로필에 보관합니다.
- alarms: 실패한 GitHub 저장 작업을 백그라운드에서 제한된 횟수로 재시도합니다.
- https://api.github.com/*: 사용자가 선택한 저장소와 브랜치를 확인하고 코드와 README를 커밋합니다.
- https://leetcode.com/*: 문서 시작 시 제출 및 채점 통신을 관찰합니다. 리트코드는 문제 목록에서 새 문서 로드 없이 문제로 이동할 수 있어 도메인 범위에서 로드하고, 저장 대상은 문제 URL과 일치하는 정답 제출로 제한합니다.
- https://school.programmers.co.kr/learn/courses/30/lessons/*: 해당 문제 페이지에서 제출 코드와 전체 통과 결과를 연결합니다.

### 원격 코드

사용하지 않음. 실행 코드는 확장 패키지에 포함됩니다. GitHub 응답과 제출 코드는 데이터로만 처리하며 실행하지 않습니다.

### 데이터 사용 공개 초안

운영자 서버가 없다는 이유로 '처리하는 데이터 없음'을 선택하지 마세요. 확장은 아래 데이터를 로컬 처리하고 일부를 사용자가 지정한 GitHub로 전송합니다. 대시보드의 최신 정의와 일치하도록 최종 확인하세요.

- Authentication information: GitHub 개인 액세스 토큰
- Website content: 제출 소스 코드, 문제 제목·번호·URL 및 채점 결과
- User activity: 문제 제출 행위와 제출·감지 시각
- Web history: 전체 방문 기록은 수집하지 않으나 저장한 문제의 URL을 처리·전송하므로 방문 페이지 URL을 포함하는 정의라면 이 항목도 공개

판매, 광고, 신용도 평가, 핵심 기능과 무관한 전송에는 사용하지 않습니다. 데이터 사용 확인 항목은 PRIVACY.md 및 실제 구현과 대조해 제출자가 인증합니다.

## 심사자용 테스트 안내 — English

No DailyPS Hub account is required. The extension requires the reviewer's own GitHub account and a repository initialized with a README. Create a fine-grained token restricted to that repository with Contents read/write. Enter the token, repository owner/name, existing branch, and output folder in Options. Never include a real token in this submission note.

Sign in to LeetCode or Programmers using your own test account. Reload the problem page after installing the extension. Submit an accepted single-file solution (for example Java). Check the popup and the selected GitHub repository for the source file and README. Run-only results and incorrect submissions must not be saved. Solve a second problem without reloading to check client-side navigation. Turn auto-save off to pause captures and queue processing. Disconnect removes the local token.

The attached screenshots show the actual extension UI with illustrative test repository settings. Browser tests use mocked APIs; they do not claim a live account connection.

## 최종 제출 순서

1. Chrome Web Store 개발자 대시보드에서 본인 계정으로 등록·이메일 확인·요구되는 인증을 완료합니다. 약관 동의와 등록 결제가 요구되면 본인이 진행합니다.
2. 새 항목에 웹스토어 ZIP을 업로드합니다.
3. 위 등록 정보, 이미지, 개인정보 URL, 권한 사유, 데이터 사용 공개를 입력합니다.
4. 연락처·게시자 정보 및 대상 지역을 본인 정보로 확인합니다.
5. 대시보드 필수 항목 검증을 통과한 뒤 심사 제출합니다. 승인과 실제 공개 전에는 웹스토어 설치 링크가 없습니다.
6. 웹스토어 설치본과 개발자 모드 설치본을 동시에 켜면 중복 저장될 수 있으므로 이전 설치의 자동 저장을 끕니다. 두 설치의 로컬 토큰·대기열은 자동 이전되지 않습니다.

## 확인한 공식 문서

- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy

확인일: 2026-10-19. 심사 승인 자체는 보장되지 않습니다.
