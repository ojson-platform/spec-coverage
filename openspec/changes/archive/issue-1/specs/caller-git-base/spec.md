## REMOVED Requirements

### Requirement: SPEC_COVERAGE_BASE does not select the base

**Reason**: There is no caller-named base. A set `SPEC_COVERAGE_BASE` is not a behavior the caller can use.
**Migration**: The package chooses the base.
