# Template Module — Canonical Reference

This module is the **canonical reference** for creating new NestJS feature modules with pagination, filtered queries, observability, and metrics. It is **not** imported in `AppModule` — it exists solely as a template to copy and adapt.

## Purpose

Use this template when creating new modules that have:

- Pagination and filtered listings
- OpenTelemetry spans (`withSpan`)
- Domain-specific metrics (`*MetricsService`)
- Multiple DTOs (Create, Update, Filter, Response)
- Comprehensive unit tests with fixtures and mocks

For simple CRUD without these features, use `store` or `user-session` as lighter references.

## Dependencies

When copying this template into a new app or isolated module: ensure `ObservabilityModule` is imported somewhere (e.g. via `ResponseModule` in `AppModule`). `ObservabilityService` is provided globally; without it, the service and metrics will fail at runtime.

## Checklist for New Modules (Copy from Template)

When creating a new module from this template:

- [ ] **Dependencies**: If the app does not import `ResponseModule` or another module that imports `ObservabilityModule`, add `ObservabilityModule` to the root or new module so `ObservabilityService` is available
- [ ] **DTOs**: Create, Update, Filter (extending `BasePaginationParams`), Response
- [ ] **Entity**: `@Entity('snake_case_table')`, kebab-case file name
- [ ] **Service**: Business logic, `@InjectRepository`, `withSpan` for critical ops, `Logger`
- [ ] **Controller**: Thin, delegates to service; `@ApiDoc`, `ParseUUIDPipe` for `:id`
- [ ] **Module**: Register entity, controller, service(s), exports
- [ ] **Constants**: Span names and attributes in `constants/<module>-span.constants.ts`
- [ ] **Metrics**: `*MetricsService` with `onModuleInit`, Prometheus counters/histograms
- [ ] **Endpoint docs**: `src/docs/<module>.endpoints.ts` with `EndpointDocSpec`
- [ ] **Tests**: `__tests__/` with fixtures, mocks, service specs
- [ ] **Entity indexes**: Consider `@Index()` on columns frequently used in WHERE/filters

## References

- [AGENTS.md](../../AGENTS.md) — Agent guide, anti-patterns, verification
- [docs/CONVENTIONS.md](../../docs/CONVENTIONS.md) — DTOs, REST, Swagger, pagination, testing
- [docs/PLAN_TEMPLATE.md](../../docs/PLAN_TEMPLATE.md) — Technical plan format for AI agents
- [**tests**/README.md](./__tests__/README.md) — Test structure and conventions
