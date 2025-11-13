# Contributing to Revolt

Thank you for your interest in contributing to Revolt! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Focus on the code, not the person
- Help create a welcoming environment

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Device/OS information

### Suggesting Features

1. Check if feature already requested
2. Use the feature request template
3. Explain:
   - The problem it solves
   - Proposed solution
   - Alternative solutions considered
   - MVP vs future consideration

### Pull Requests

#### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Ran `npm run lint` without errors
- [ ] Ran `npm run type-check` successfully
- [ ] Tested on actual device via Expo Go
- [ ] Added docstrings to major functions
- [ ] Updated documentation if needed

#### PR Process

1. Fork the repository
2. Create feature branch from `develop`
3. Make your changes
4. Write clear commit messages (Conventional Commits)
5. Push to your fork
6. Open PR against `develop` branch
7. Fill out PR template completely
8. Wait for CI/CD checks to pass
9. Address review feedback
10. Await approval and merge

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

## Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `docs/update-name` - Documentation updates

### Commit Messages

Follow Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(map): add real-time station availability

Implemented WebSocket connection to backend for live updates
of charging station availability status.

Closes #123
```

```
fix(navigation): resolve back button crash

Fixed undefined route params causing app crash when navigating
back from StationProfile screen.

Fixes #456
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript mode
- Define types for all props and state
- Use interfaces for objects, types for unions
- Avoid `any` type

### React Native

- Use functional components with hooks
- Destructure props for clarity
- Use meaningful variable names
- Keep components focused and small

### File Organization

- One component per file
- Export component as default
- Name file same as component (PascalCase)
- Keep related files together

### Documentation

- Add docstrings to exported functions/components
- Explain complex logic
- Keep docstrings concise
- Update docs with code changes

## Testing Guidelines

### Manual Testing

1. Test on both iOS and Android
2. Test on different screen sizes
3. Test edge cases
4. Test error scenarios
5. Test offline behavior

### Code Review Focus

- Correctness and functionality
- Code quality and readability
- Performance considerations
- Security implications
- User experience

## Getting Help

- Read [DEVELOPMENT.md](./DEVELOPMENT.md)
- Search existing issues
- Ask in pull request comments
- Contact maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to Revolt! 🚀
