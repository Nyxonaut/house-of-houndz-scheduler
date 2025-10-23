# Contributing Guide

Thank you for contributing to the House of Houndz Scheduler. This document outlines expectations for branching, testing, and pull requests.

## Branching Strategy
- `main`: Stable, deployable releases only.
- `dev`: Integrates completed features bound for the next release.
- `feature/*`: Feature-specific branches branched off `dev`.
- `hotfix/*`: Production fixes branched off `main`.

## Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
- `feat`: New functionality.
- `fix`: Bug fix.
- `docs`: Documentation changes.
- `style`: Formatting/no logic changes.
- `refactor`: Behaviour preserving improvements.
- `chore`: Tooling/maintenance.

## Pull Requests
1. Create PRs against `dev` unless addressing a production hotfix.
2. Link related issues and add appropriate labels.
3. Include a summary, testing notes, and screenshots (if UI change).

## Testing Expectations
- Backend: `pytest` / Django test suite.
- Frontend: `npm run test` (when configured).
- CI must pass before merging.

## Code Review
- Aim for small, focused PRs (<400 lines when possible).
- Respond to feedback promptly; prefer follow-up commits over force-push.

## Release Process
1. Merge `dev` into `main` for release.
2. Tag the commit (`git tag vX.Y.Z`).
3. Push tags (`git push origin --tags`).

