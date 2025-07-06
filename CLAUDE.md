# Claude Development Guide

## Project Overview
This is an Atlas AI conversations hub built with React, TypeScript, and Tailwind CSS. The application features a chat interface with AI model selection, dark mode support, and file upload capabilities.

## Task Management with GitHub Issues

### Why Use GitHub Issues
- **Centralized tracking**: All tasks are visible to the team and easily searchable
- **Persistent history**: Issues remain accessible across sessions
- **Integration**: Links directly to code changes and pull requests
- **Collaboration**: Team members can comment, assign, and track progress

### GitHub Issues Setup

#### 1. Create Personal Access Token
1. Visit: https://github.com/settings/personal-access-tokens/new
2. Name: "Claude MCP Server"
3. Expiration: Choose appropriate duration (90 days recommended)
4. Repository access: Select "Selected repositories" and choose this repo
5. Permissions needed:
   - **Issues**: Read and write
   - **Pull requests**: Read and write
   - **Contents**: Read
   - **Metadata**: Read

#### 2. Configure Environment Variable
Add to your shell configuration file:

```bash
# For zsh users
code ~/.zshrc

# Add this line:
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"

# Reload shell
source ~/.zshrc
```

#### 3. Add GitHub MCP Server
```bash
claude mcp add github-server -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

### Using GitHub Issues for Task Management

#### Label System 🏷️
This project uses a structured label system to help Claude identify and manage workloads:

**Workflow Labels:**
- `claude-todo` - Tasks that Claude should work on
- `claude-in-progress` - Tasks currently being worked on by Claude  
- `claude-completed` - Tasks completed by Claude

**Category Labels:**
- `ui-enhancement` - User interface improvements and styling
- `dark-mode` - Dark mode and theming related tasks
- `development-workflow` - Developer tools and workflow improvements

#### Current Project Status
**Repository**: `johndpope/atlas-ai-conversations-hub`

**Completed Work ✅**
- Issue #1: Grok-style Dark Mode UI Implementation
- Issue #2: GitHub Issues Integration Setup

**Current Todo List 📋**
- Issue #3: Theme Toggle Component (Medium Priority)
- Issue #4: Chat Message Styling (High Priority)
- Issue #5: Conversation History Sidebar (Medium Priority)
- Issue #6: Typing Indicators & Message Status (Medium Priority)
- Issue #7: Model Settings Panel (Medium Priority)
- Issue #8: File Upload Enhancement (High Priority)
- Issue #9: Keyboard Shortcuts & Accessibility (High Priority)
- Issue #10: Project Roadmap Overview (Reference)

#### Quick Commands for Claude
```bash
# Check all pending tasks
gh issue list --label="claude-todo"

# See current work in progress
gh issue list --label="claude-in-progress"

# View completed work
gh issue list --label="claude-completed"

# Start working on an issue (move from todo to in-progress)
gh issue edit 3 --add-label="claude-in-progress" --remove-label="claude-todo"

# Complete an issue (move to completed)
gh issue edit 3 --add-label="claude-completed" --remove-label="claude-in-progress"

# Create new issue with appropriate labels
gh issue create --title "New Feature" --label "claude-todo,ui-enhancement"
```

#### Creating Issues
When starting work on new features or bugs:
```bash
gh issue create --title "Feature: Add dark mode toggle" --label "claude-todo,ui-enhancement" --body "## Summary
Brief description of the task

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
Additional context or requirements"
```

#### Issue Templates
Use these templates for different types of work:

**Feature Request:**
```markdown
## Summary
Brief description of the feature

## Acceptance Criteria
- [ ] Requirement 1
- [ ] Requirement 2

## Design Notes
Any design considerations or mockups

## Technical Notes
Implementation details or constraints
```

**Bug Report:**
```markdown
## Summary
Brief description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser:
- OS:
- Version:
```

#### Linking Issues to Code
- Reference issues in commit messages: `git commit -m "Fix button styling - closes #5"`
- Link pull requests to issues
- Use GitHub's closing keywords: `closes`, `fixes`, `resolves`

## Development Workflow

### Claude Workflow Instructions 🤖

#### Before Starting Work
1. **Check Project Status**: Review Issue #10 (Project Roadmap) for current priorities
2. **Select Issue**: Choose from `claude-todo` labeled issues based on priority
3. **Update Status**: Move issue from `claude-todo` to `claude-in-progress`
4. **Branch Strategy**: Create branch with issue reference: `feature/3-theme-toggle`

#### During Development
1. **Commit Messages**: Reference issue numbers: `git commit -m "Add theme toggle component - addresses #3"`
2. **Progress Updates**: Comment on issues with progress, blockers, or questions
3. **Code Quality**: Follow existing patterns and run lint/typecheck before commits
4. **Testing**: Ensure changes work with existing functionality

#### Completing Work
1. **Acceptance Criteria**: Verify all checklist items are completed
2. **Update Labels**: Move issue from `claude-in-progress` to `claude-completed`
3. **Close Issues**: Use closing keywords in final commit: `closes #3`
4. **Documentation**: Update this file if workflow changes

### 1. Planning Phase
- All work is tracked in GitHub Issues with appropriate labels
- High priority issues should be addressed first
- Break down large features into smaller, manageable issues
- Use the established label system for categorization

### 2. Development Phase
- Reference issue numbers in branch names: `feature/3-theme-toggle`
- Make atomic commits that address specific parts of the issue
- Update issue labels to reflect current status
- Comment on issues with progress and any blockers discovered

### 3. Review Phase
- Create pull requests that reference the issue
- Ensure all acceptance criteria are met
- Run quality checks: `pnpm run lint && pnpm run typecheck`
- Test functionality across different screen sizes and themes

### 4. Completion Phase
- Verify all acceptance criteria are completed
- Update issue labels to `claude-completed`
- Close issues with PR merge using keywords: `closes #3`
- Create follow-up issues for any additional work discovered

## Project Structure

### Key Directories
- `/src/components/` - React components
- `/src/pages/` - Page components
- `/src/contexts/` - React contexts (theme, etc.)
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Utility functions
- `/src/i18n/` - Internationalization files

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **CSS custom properties** for theming
- **Dark mode** support via CSS classes
- **Design tokens** for consistent spacing and colors

### Component Patterns
- Use TypeScript interfaces for all props
- Implement proper error boundaries
- Follow React best practices for hooks and state management
- Use React.forwardRef for components that need ref forwarding

## Testing Strategy

### Types of Testing
- **Unit tests**: Individual component functionality
- **Integration tests**: Component interactions
- **E2E tests**: Full user workflows
- **Visual regression**: UI consistency

### Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- Cypress or Playwright for E2E testing

## Deployment

### Build Process
```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

### Environment Variables
- Document all required environment variables
- Use `.env.example` file for reference
- Never commit actual API keys or secrets

## Best Practices

### Code Quality
- Use ESLint and Prettier for consistent formatting
- Follow TypeScript strict mode
- Implement proper error handling
- Write meaningful commit messages

### Performance
- Lazy load routes and heavy components
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper loading states

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

### Security
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Keep dependencies updated

## Troubleshooting

### Common Issues
1. **Build failures**: Check TypeScript errors and dependency versions
2. **Styling issues**: Verify Tailwind classes and CSS custom properties
3. **API failures**: Check network requests and error handling
4. **Performance**: Use React DevTools profiler

### Debug Commands
```bash
npm run lint     # Check for linting errors
npm run typecheck # Check TypeScript errors
npm run test     # Run test suite
```

## Contributing

### Before Starting Work
1. Check existing GitHub issues
2. Create new issue if needed
3. Get issue assigned to you
4. Create feature branch

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Reference the issue in PR description
4. Request review from team members
5. Address review feedback
6. Merge after approval

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] TypeScript types are properly defined
- [ ] Accessibility requirements are met