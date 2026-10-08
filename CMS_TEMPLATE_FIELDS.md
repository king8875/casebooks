# 상세 페이지 CMS 연동 가이드 (블로그 · 포트폴리오)

기준: veryeasy.kr CMS가 실제로 출력하는 페이지
(`/blog/multilingual-website`, `/blog/홈페이지-제작-후`, `/portfolio/kjcenter`)를 열어 확인한 구조입니다.
**확인한 것**과 **추정한 것**을 구분해 적었습니다. 추정 항목은 CMS 관리자 설정으로 확정이 필요합니다.

## 1. 누가 무엇을 채우는가 (블로그)

| 구분 | 필드 | 비고 |
|---|---|---|
| 사람 입력 | 제목(h1), 본문 | 확인: 질문대로 사람이 작성 |
| 사람 입력(추정) | 부제목(summary), 카테고리, 글쓴이, 게시일, 대표 이미지 | 화면에 나오지만 AI 산출물인지 불명 |
| **AI 생성** | 핵심 포인트, 주석, 목차, 태그 | 확인: 질문대로 AI가 추출 |
| AI 생성(추정) | meta description(요약보다 긴 별도 문장) | 두 글 모두 summary와 다름 |
| 자동 | 조회수, 이전 글/다음 글, 구조화 데이터 | |
| 선택 | 이어보기 카드, 이미지 여러 장 | 한 글에는 있고 다른 글에는 없음 |

## 2. AI 산출물의 개수·형태 (관찰값)

| 항목 | 글 A (multilingual-website) | 글 B (홈페이지-제작-후) | 템플릿 가정 |
|---|---|---|---|
| 핵심 포인트 | 3개, 한 문장, 약 45~50자 | 3개, 한 문장, 마침표 없음 | **3개 고정으로 보임**, 개수는 가변 처리됨 |
| 주석 | 4개 | 7개 | **개수 가변**, 본문 용어 수와 같아야 함 |
| 태그 | 5개 | 2개 | **개수 가변** |
| 목차 | h2 + h3 (8개) | h2만 (6개) | 본문 h2/h3에서 생성, h3는 들여쓰기 |
| 이어보기 카드 | 있음 | 없음 | 선택 |

주석 번호(`note-1`…)는 본문 등장 순서가 아니라 AI가 매긴 순서입니다(글 A: 첫 용어가 `term-2`).
템플릿은 `data-note`/`data-term`으로 짝을 맞추므로 **순서와 무관하게 동작**합니다.

## 3. 블로그 상세 HTML 연결 지점

| 요소 | 선택자 / 속성 | 비고 |
|---|---|---|
| 본문 영역 | `[data-article-content]` (`.article-content`) | 목차가 이 안의 h2/h3에서 생성됨. 제목에 `id="section-N"`이 있으면 유지, 없으면 JS가 부여 |
| 본문 용어 | `<button class="article-term" id="term-N" data-note="note-N">` | 본문 `p, li, blockquote, td` 안에서 사용 |
| 주석 목록(좌측) | `<button class="article-note-item" id="note-N" data-term="term-N">` + `.note-no`, `strong`, `em` | 번호/용어/설명 |
| 주석 팝업용 데이터 | `<template data-note-data="note-N" data-title="용어">설명</template>` | 좁은 화면에서 팝오버로 표시 |
| 핵심 포인트 | `.article-read-points ol > li` | |
| 목차 | `[data-toc]` (JS 생성) 또는 CMS 출력 `aside.article-side--right > nav > a.toc-h2/.toc-h3` | CMS가 직접 출력해도 같은 스타일. 단 스크롤 강조는 `[data-toc]`일 때만 동작 |
| 태그 | `.article-tags a` | |
| 이전/다음 글 | `a.post-nav-card.prev` = **더 오래된 글**, `.next` = **더 최신 글** | veryeasy와 동일한 의미. 없으면 `.is-empty` |
| 다른 블로그 보기 | `[data-list-layer]` + `.article-list-item` | 현재 글에 `aria-current="page"` |
| 링크 공유 | `[data-share]` + `data-share-title` | PC는 링크 복사, 모바일은 공유 시트 |
| 대표 이미지 | `[data-media-carousel]` | 2장 이상이면 화살표·점 자동 표시 |

## 4. 포트폴리오 상세

veryeasy 구조를 따르고 맨 위 슬라이드는 쓰지 않습니다(`.portfolio-primary` 단일 이미지).

| 구분 | 필드 | veryeasy 대응 |
|---|---|---|
| 정보 표(좌측) | 사례집 유형, 발주 기관, 판형·제본, 진행 범위 | 프로젝트 타입, 클라이언트, 플랫폼, 키 서비스 |
| 설명 | 리드 문단 1~2개 | 프로젝트 설명 |
| 문제와 목표 4블록 | 핵심 키워드 / 제작 과정(+흐름) / 독자 질문 / 제작 범위 | 업종별 검색어 / 문제 해결 과정 / 검색 의도 질문 / 제작 범위 비교 |
| 바로가기 | 전자책 보기(선택) | 사이트 바로가기 |
| 태그, 목차 | 5개 안팎 / h2 2개 | 동일 |

## 5. 아직 확정되지 않은 것 (CMS 쪽에서 확인 필요)

1. **도메인**: `canonical`, `og:image`, JSON-LD의 `image`/`mainEntityOfPage`/`url`은 절대 주소가 필요해 비워 두었습니다.
2. **meta description**: 현재는 부제목을 그대로 씁니다. CMS가 별도 문장을 만들면 그 값을 쓰면 됩니다.
3. **목차를 누가 만드는가**: 현재는 JS가 본문 제목에서 생성합니다. CMS가 서버에서 출력하면 `data-toc`를 빼면 됩니다(스크롤 강조는 별도 연결 필요).
4. **주석 마크업**: 본문의 용어 버튼과 좌측 주석 목록을 CMS가 같은 형태로 출력하는지 확인이 필요합니다.
5. **대표 이미지 여러 장**: veryeasy는 `blog-media-carousel__slide` 구조를 씁니다. 이쪽은 `media-carousel` 구조라 클래스가 다릅니다.
6. 포트폴리오 목록 카드의 이미지 3장을 어디서 가져올지(상세에는 대표 이미지 한 장뿐).
