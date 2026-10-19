TITLE: [STORY] As a store owner, I can view store stats so that I see at-a-glance metrics
LABELS: enhancement

---

<!-- Use English strictly. Canonical STORY example — see docs/issues/TEMPLATES.md -->

## Context

Expose aggregated store statistics to power the admin dashboard. Enables at-a-glance metrics without separate queries.

## Acceptance criteria

- [ ] GET /stores/:id/stats returns 200 with { monthlySales, activeProductCount, lowInventoryCount }
- [ ] Unauthorized users receive 401; non-owners receive 403
- [ ] 404 when store does not exist
- [ ] Unit tests for store.service.getStats()

## Out of scope

- Charts or visualization
- Historical time series (snapshot only)

## References

- AGENTS.md, docs/CONVENTIONS.md, src/docs/store.endpoints.ts
