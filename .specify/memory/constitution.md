<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0 (MINOR: Initial constitution with 7 core principles + governance framework)
Modified Principles: N/A (initial creation)
Added Sections: Core Principles (7x), Quality Gates, Governance
Removed Sections: N/A
Templates Updated: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
Follow-up TODOs: RATIFICATION_DATE, LAST_AMENDED_DATE - mark as today (2026-01-27) on first approval
-->

# Asistencia Cámara Charts Constitution

## Core Principles

### I. Code Quality
Every feature MUST meet quality standards: types checked, linting passed, no dead code, clear naming. Code readability > cleverness. Technical debt is tracked and repaid incrementally. No shortcuts for convenience or schedule pressure.

**Rationale**: Quality compounds. Small shortcuts accumulate into unmaintainable systems. Prevent regression and reduce future refactoring burden by enforcing standards upfront.

### II. Modularity
Code MUST be organized into isolated, independently testable units. Each module has single responsibility. Dependencies flow one direction only—no circular refs. Interfaces are explicit, not implicit. Modules can be understood without reading the entire codebase.

**Rationale**: Modularity enables parallel development, independent testing, and safe refactoring. Tight coupling breeds complexity and blocks agility.

### III. Usability
User-facing features MUST be discoverable and intuitive. Actions require minimal learning curve. Error messages guide users toward solutions. Workflows reduce cognitive load. If a feature requires documentation to understand, it is not ready.

**Rationale**: Usability determines adoption. Complex UX drives support costs and abandonment. Every interaction is a design decision that impacts user success.

### IV. Accessibility
All user-facing interfaces MUST comply with WCAG 2.1 AA standards. Screen reader support required. Keyboard navigation required. Color MUST not be sole information vector. Text contrast minimum 4.5:1 for body text. Testing with assistive tech is non-negotiable before merge.

**Rationale**: Accessibility is inclusion, not compliance checkbox. Benefit all users: elderly, distracted, diverse abilities. Legal requirement in many jurisdictions.

### V. Testing Standards
Coverage target: >80% for core logic. Unit tests MUST be written first (red-green-refactor). Integration tests MUST validate user journeys. Tests are documentation—names describe what/why. Flaky tests MUST be fixed immediately, not skipped. No test merges if coverage drops.

**Rationale**: Tests catch regressions early. Test-first clarifies requirements. Coverage <80% indicates unmeasured risk.

### VI. User Experience Consistency
All user-facing interactions MUST follow consistent patterns within this app. Button styles, form layouts, error handling, loading states, success feedback use same components/logic. Visual design system is single source of truth. Deviations require explicit design approval.

**Rationale**: Consistency reduces learning curve. Users build mental models; breaking them is costly. One design language scales across features.

### VII. Performance Requirements
Page/view load times MUST be <3 seconds for core interactions. API responses <500ms (p95). Bundle size <500KB initial JS. Memory usage <100MB for typical session. Mobile-first: test on 4G + mid-tier device (Pixel 4a equivalent). Performance budgets enforced in CI/CD.

**Rationale**: Performance is feature. Slow apps lose users. Mobile users on poor networks are real. Performance debt multiplies across features.

## Quality Gates

These gates enforce principles before code merges:

1. **Type Safety**: TypeScript/language type checking MUST pass. No `any` types unless documented exception.
2. **Linting & Formatting**: ESLint/language linter configuration MUST pass. Auto-fix applied where safe.
3. **Test Coverage**: All new code MUST have tests. Coverage <80% blocks merge. Tests MUST be reviewed for quality, not just coverage %.
4. **Accessibility**: Automated a11y checks MUST pass. Manual screen reader test MUST be done for UX changes.
5. **Performance**: Bundle analysis MUST show no unexplained regressions. Load time tests MUST pass.
6. **Design Review**: UX consistency MUST be approved (visual diff required if touching UI).

## Development Workflow

### Implementation Checklist Per Feature

Before starting:
- [ ] Constitution Check: Does feature align with 7 principles? Flag conflicts in PR.
- [ ] Design approved: UX consistency gate passed.
- [ ] Tests planned: User journey tests outlined before code.

During development:
- [ ] Tests written first, then implementation.
- [ ] Code passes all quality gates.
- [ ] Accessibility verified on real devices/readers.
- [ ] Performance budgets met.
- [ ] Documentation updated (inline code + user-facing).

Before merge:
- [ ] All gates pass.
- [ ] Code review covers: principle alignment, modularity, edge cases.
- [ ] Accessibility sign-off from design.

### Amendment & Versioning

**Amendment Procedure**: Principle changes require pull request with justification. Changes proposed in PR description map to: which principle, why change needed, impact on templates. All team members must have opportunity to comment. Merge when consensus reached or after defined discussion period.

**Version Bumps**:
- **MAJOR**: Principle removal/redefinition (breaking change to development standards).
- **MINOR**: New principle added or significant expansion to existing principle.
- **PATCH**: Wording clarification, typo fix, non-material refinement.

**Compliance Review**: Constitution governs all PRs. Every PR MUST reference which principles it upholds. Violations require explicit justification in PR (complexity tracking section in plan.md).

---

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Approve and set to 2026-01-27 | **Last Amended**: TODO(LAST_AMENDED_DATE): Approve and set to 2026-01-27
