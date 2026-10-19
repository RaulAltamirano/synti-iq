# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-10-19)


### Features

* **address-management:** introduce customer address management endpoints, including creation, retrieval, and deletion of shipping and billing addresses, and update authentication to allow optional role in sign-up ([b2c3859](https://github.com/RaulAltamirano/synti-iq/commit/b2c38598ef022b372545a0ddf846ad193d08b5ec))
* **auth:** add API documentation for authentication endpoints and enhance user session management with detailed endpoint specifications ([b904b00](https://github.com/RaulAltamirano/synti-iq/commit/b904b0064f569122d9719164ff161c761b9136bf))
* **auth:** enhance authentication and authorization by introducing role-based access control, updating user roles, and refining profile management ([7f70eb9](https://github.com/RaulAltamirano/synti-iq/commit/7f70eb953c57227f28481f23d82b79f143315153))
* **auth:** implement cookie-based authentication, enhance API documentation, and refactor logging with nestjs-pino integration ([23e87a9](https://github.com/RaulAltamirano/synti-iq/commit/23e87a9b95ad31f82d80628b77b20e72aab1b2b4))
* **ci:** enhance PR review workflow with SonarCloud integration ([8e76a90](https://github.com/RaulAltamirano/synti-iq/commit/8e76a900c9e108bd73e5a145233021b6fd03c91d))
* **database:** add seed runner script for seeding permissions, groups, roles, and users with logging for process status ([44cc590](https://github.com/RaulAltamirano/synti-iq/commit/44cc5909fcfc3627884704f627a1a4ec6f070c5d))
* **discord:** add notification for new or updated PRs via Discord webhook ([0fc42ff](https://github.com/RaulAltamirano/synti-iq/commit/0fc42ffb79018a4f852c1c1820201e6227943a75))
* **discord:** enhance thread management for commit notifications ([eede543](https://github.com/RaulAltamirano/synti-iq/commit/eede54337852ecb06ef8f1b300b42f2edb31fd99))
* **discord:** implement thread management for Discord notifications ([0b03f3a](https://github.com/RaulAltamirano/synti-iq/commit/0b03f3a29b6ab2a30217355daed829e8d6e451a7))
* **observability:** integrate OpenTelemetry for enhanced observability, add global exception handling, and implement request ID tracking across requests ([3483cf3](https://github.com/RaulAltamirano/synti-iq/commit/3483cf39b8e45e85acce88f4034684690376e0d9))
* **observability:** Jaeger, OTel preload, health/metrics, spans ([3ec3976](https://github.com/RaulAltamirano/synti-iq/commit/3ec3976c58ca033b96d74f35cda134d2e5ffb987))
* **pr-review:** concise format, auto-approve on pass, Octokit createReview ([a3ce6da](https://github.com/RaulAltamirano/synti-iq/commit/a3ce6da84c5348bcde9ce42c5756fde10ded25b2))
* **shared:** add vehicle type enum and recurrence rule dto ([040460b](https://github.com/RaulAltamirano/synti-iq/commit/040460b91701a51eb4124349098d2b0cef8f701e))
* **store:** extract StoreCashierService with cashier ops and invitation ([e20c588](https://github.com/RaulAltamirano/synti-iq/commit/e20c588b422a92354c5b17fe4ec1c3b124381916))
* **store:** extract StoreMutationService with create/remove ([2d9f4e5](https://github.com/RaulAltamirano/synti-iq/commit/2d9f4e57f705f89c7af6dd5bf9533720b0d9eecc))
* **store:** extract StoreQueryService with read ops and list cache ([5ee5f4a](https://github.com/RaulAltamirano/synti-iq/commit/5ee5f4a7bcd5728f467faefe1d7e379e1e076fa4))
* **store:** register sub-services in StoreModule ([3161b27](https://github.com/RaulAltamirano/synti-iq/commit/3161b2765bbf4a523c4130c41110449c4a13b5f5))
* **test:** migrate to v8 coverage, merge src+scripts into single report ([004fb47](https://github.com/RaulAltamirano/synti-iq/commit/004fb47a3e98c20ab0792e6b84b614635921f6f3))
* **user:** business user route and filters stack ([fd6f313](https://github.com/RaulAltamirano/synti-iq/commit/fd6f313e1f76e8bd3efe82c2090ce868613d0b7c))


### Bug Fixes

* **auth,store:** address code review findings ([e8f4618](https://github.com/RaulAltamirano/synti-iq/commit/e8f4618a9921cdf1628ae8861f3bb764b1db369c))
* **auth,user-session:** fix invalidation order, atomic INCR, complete facade, extract constants ([d48f087](https://github.com/RaulAltamirano/synti-iq/commit/d48f0873c969caaba346dd0c3261157060ed9f85))
* **auth:** atomic Redis INCR for refresh count ([728f83b](https://github.com/RaulAltamirano/synti-iq/commit/728f83bd845dca1928f5eaaf6e382e00ae6a741f))
* **auth:** clean up SessionService and expand test mock ([2e2f0e8](https://github.com/RaulAltamirano/synti-iq/commit/2e2f0e80ed98995502e13eb6bfe0058ccfd86ab1))
* **auth:** use raw Redis read for INCR and document race trade-off ([086a803](https://github.com/RaulAltamirano/synti-iq/commit/086a8035fd2050aa2145dae588aa052919c66315))
* **ci:** reduce lint heap to 4GB; add GitHub App auth diagnostic for pr-review ([6c2a96c](https://github.com/RaulAltamirano/synti-iq/commit/6c2a96c360feea78f003348e159f10bbfeb3c601))
* **deps:** add resolutions for ajv and qs to fix yarn audit vulnerabilities ([0bc1049](https://github.com/RaulAltamirano/synti-iq/commit/0bc1049cb9e171fa2582547215ac9fc109cb0235))
* **pr-review:** add truncation safeguard and error handling for GitHub comment limit ([9d5f03f](https://github.com/RaulAltamirano/synti-iq/commit/9d5f03f18583e095ed693bfa43c0240974ff4225))
* **pr-review:** handle 403 on getAuthenticatedLogin for GitHub App tokens ([8e00af8](https://github.com/RaulAltamirano/synti-iq/commit/8e00af8608d2ce5249563e86eb65db407c6dc566))
* **sale:** register Sale entity in SaleModule forFeature ([3a357db](https://github.com/RaulAltamirano/synti-iq/commit/3a357db08704b3ad469134e4e27b9d84993c00c6))
* **security:** prefer node:crypto imports for Sonar ([ed48581](https://github.com/RaulAltamirano/synti-iq/commit/ed4858129745755f5f37ba4e754b037f18831762))
* **security:** use crypto.randomInt for backup and referral codes ([a206dc5](https://github.com/RaulAltamirano/synti-iq/commit/a206dc55815e918ec8a02b27b3ab31b43834ef71))
* **security:** use crypto.randomInt for backup and referral codes ([ad5319d](https://github.com/RaulAltamirano/synti-iq/commit/ad5319d8aecf6e1258746491ef5a2341b786a851))
* **store:** correct cache TTL and extract cache constants ([bc41873](https://github.com/RaulAltamirano/synti-iq/commit/bc41873bc362e2b3858053c604aba96413d4b37d))
* **store:** fix catch blocks, rethrow HttpException, use softDelete ([c6d5110](https://github.com/RaulAltamirano/synti-iq/commit/c6d51107d95682405bbae376194292c1b17e4b15))
* **store:** pass string context to logger.warn instead of object ([1eb4c54](https://github.com/RaulAltamirano/synti-iq/commit/1eb4c542205cf979d3a292db1d42d4fddcb411f8))
* **store:** remove unused entities from forFeature ([c343255](https://github.com/RaulAltamirano/synti-iq/commit/c343255f3b748db49b768cf7be95a6ee884e47ca))
* **store:** use TypeORM In() operator in removeCashiersFromStore ([d461236](https://github.com/RaulAltamirano/synti-iq/commit/d461236c66b0fdb8b8c0897af5e245fa1d539ea0))
* translate CI_CD_AUDIT_BEFORE_AFTER to English per convention ([0d44740](https://github.com/RaulAltamirano/synti-iq/commit/0d44740f9ce44c54fd7e7b80fb25ec9046e2dae5))
* **user-session:** DB before Redis in invalidation methods ([9c16441](https://github.com/RaulAltamirano/synti-iq/commit/9c1644133d9d245c8280dd24bbb3034695ce5a03))
* **user-session:** remove buildRefreshCountKey and migrate to constants ([7f9a772](https://github.com/RaulAltamirano/synti-iq/commit/7f9a772b93aa2dd63ccc7cabb492a37cf312fab9))

## [Unreleased]

### Added

- DevOps SRE standards: Conventional Commits enforcement, branching strategy, release-please, changelog, CI/CD guardrails

### Changed

- (none)

### Fixed

- (none)

---

<!-- release-please will update the following sections on each release -->
