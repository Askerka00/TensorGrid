# Contributing to TensorGrid

Thank you for your interest in contributing to TensorGrid Protocol!

## How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or suggest new features.
- Include environment details (OS version, GPU model, driver version).
- Attach relevant logs or screenshots.

### Submitting Pull Requests
1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes with clear, conventional commit messages.
4. Ensure tests pass:
   - Solana Contracts: `anchor test`
   - Frontend: `npm --prefix web run build`
   - Orchestrator: `npm --prefix server run build`
5. Open a Pull Request against `main`.

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new GPU tier detection
fix: resolve win32 mouse hook latency
docs: update architecture flow diagram
test: add anchor settlement test case
```

### Development Setup
See [Quick Start](README.md#quick-start) in the README.

## Code of Conduct
Be respectful and collaborative. We are building open DePIN infrastructure on Solana for everyone.

## Questions & Community
Reach out via [GitHub Discussions](https://github.com/Askerka00/TensorGrid/discussions) or open an issue.
