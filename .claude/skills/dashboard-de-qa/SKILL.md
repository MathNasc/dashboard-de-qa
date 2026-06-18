```markdown
# dashboard-de-qa Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `dashboard-de-qa` repository, a TypeScript project built with Next.js. You'll learn how to structure files, write imports and exports, follow commit message patterns, and write tests in alignment with the repository's standards.

## Coding Conventions

### File Naming
- Use **camelCase** for file and folder names.
  - Example: `userProfile.ts`, `dashboardHeader/`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { getUser } from '@/services/userService';
    ```

### Export Style
- Use **named exports** exclusively.
  - Example:
    ```typescript
    // userService.ts
    export function getUser(id: string) { ... }
    ```

### Commit Patterns
- Commit messages are **freeform**, with no strict prefix required.
- Average commit message length is short (about 12 characters).
  - Example: `add login`, `fix bug`, `update UI`

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- Test files use the pattern: `*.test.*`
  - Example: `userProfile.test.ts`
- The testing framework is **unknown** (not detected), but standard test file naming applies.
- Place test files alongside the files they test or in a dedicated `__tests__` folder.

  ```typescript
  // userProfile.test.ts
  import { getUser } from '@/services/userService';

  describe('getUser', () => {
    it('returns user data', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command | Purpose |
|---------|---------|
| /test   | Run all test files matching `*.test.*` |
```
