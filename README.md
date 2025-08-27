# useJaeO

**React Query에서 핵심 기능을 직접 구현한 경량 서버 상태 관리 라이브러리입니다.**
useSyncExternalStore 기반으로 데이터 fetch, 캐싱, mutation을 단순하고 직관적으로 다룰 수 있습니다.

## React 서버 상태 관리 라이브러리

- useSyncExternalStore 기반의 초경량 데이터 패칭/캐시/구독/뮤테이션 훅
- 동일 fetchKey 기준으로 컴포넌트 간 상태 공유
- 단순한 API로 onSuccess / onError, 데이터 가공(convertFn) 지원

## Installation

```
# npm
npm i @jae-o/jaeo-query

# yarn
yarn add @jae-o/jaeo-query

# pnpm
pnpm add @jae-o/jaeo-query
```

## Usage

```ts
import { useJaeO } from '@jae-o/jaeo-query';
import { useJaeOMutation } from '@jae-o/jaeo-query';
```
