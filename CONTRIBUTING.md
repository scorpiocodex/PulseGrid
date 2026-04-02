# Contributing to PulseGrid

Thank you for your interest in contributing to PulseGrid!

## How to Contribute

### Fork the Repository

1. Click the "Fork" button on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pulsegrid.git`
3. Add upstream: `git remote add upstream https://github.com/pulsegrid/pulsegrid.git`

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-description
```

### Make Changes

1. Write your code
2. Follow existing code style
3. Add tests if applicable
4. Commit your changes:

```bash
git add .
git commit -m "feat: add new feature description"
```

### Submit a Pull Request

1. Push to your fork: `git push origin feature/your-feature-name`
2. Open a Pull Request on GitHub
3. Fill out the PR template
4. Wait for review

## Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

## Code Style

- Python: Follow PEP 8, use Black formatter
- JavaScript: Follow ESLint rules
- Use meaningful variable and function names

## Testing

Run tests before submitting:

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Questions?

Open an issue for questions about contributing.
