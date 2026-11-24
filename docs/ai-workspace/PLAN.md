# DSAI Work Desk & AI Hub Upgrade

## Scope
Polish the existing public front site, AI Hub, Work Desk and dashboard without replacing working routes, authentication, data, provider execution, file quarantine, or deployment architecture.

## Incremental slices
- [x] Verify repository stack, public routes, AI Hub catalog and connector capability boundary.
- [x] AI Hub discovery refresh: Bengali-first hero, responsive search/filter layout, shareable query/category state, clearer directory-versus-runtime status.
- [ ] Work Desk visual refresh after tracing its actual page and task-flow implementation.
- [ ] Dashboard/front-site polish after tracing existing navigation and data dependencies.
- [ ] Add focused tests and run typecheck, tests, build, accessibility and production-stub checks.
- [ ] Review preview deployment; do not deploy production without explicit approval.

## Integration policy
A catalog entry is not an executable connector. Keep website access, DSAI runtime, and personal BYOK clearly distinct. Never fabricate provider integration, free quota, model availability, or billing status.
