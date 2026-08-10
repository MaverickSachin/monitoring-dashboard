# FFMA DSE React UI

<table>
<tr><td>

[![pr-checks]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/pr-checks.yml)

</td><td>

[![dev-publish]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/dev-publish.yml)

</td><td>

[![manual-release]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/manual-release.yml)

</td></tr>
</table>

---

<table>
<tr><td>

[![storybook-dev]](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/dev/latest/)
[![storybook-stable]](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/stable/latest/)
[![storybook-deploy]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/storybook-deploy.yml)

</td></tr>
</table>

---

<table>
<tr><td>

[![cloudsmith-latest]](https://cloudsmith.io/~ffma/repos/npm/packages/detail/npm/ffma-dse-react-ui/)
[![cloudsmith-dev]](https://cloudsmith.io/~ffma/repos/npm/packages/detail/npm/ffma-dse-react-ui/)

</td></tr><tr><td>

[![coverage-status]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/pr-checks.yml)
[![typescript-status]](https://github.com/FutureFundAgency/ffma-dse-react_ui)
[![lint-status]](https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/pr-checks.yml)

</td></tr>
</table>

---

> Repo created by the DSE Team

---

## Overview

A modern React component library for FFMA, built with TypeScript, Tailwind CSS, and Storybook.

## ⚡ Quick Start (for a new React project)

For detailed instructions, see the documentation links below.

Configure your `.npmrc` for automatic registry resolution:

```bash
# Configure npm registry
echo "@ffma:registry=https://npm.cloudsmith.io/ffma/npm/" >> ~/.npmrc
```

Install the package to your React project:

```bash
# Install latest stable
pnpm install ffma-dse-react-ui

# Install development version
pnpm install ffma-dse-react-ui@dev
```

### Usage

The library is designed to be used in a React application.

Here’s a simple example of how to use the `Button` component:

````bash

```tsx
import { Button } from 'ffma-dse-react-ui/components'

function App() {
  return (
    <Button variant="primary" size="medium">
      Click me!
    </Button>
  )
}
````

#### Imports

The library is modular, allowing you to import only the components you need:

```tsx
// Import specific components
import { Button } from 'ffma-dse-react-ui/components'

// Import specific utility
import { cn } from 'ffma-dse-react-ui/utils'
```

Or you can import from the top of the library if your file will use a mixture of things:

```tsx
import { Button, cn } from 'ffma-dse-react-ui'
```

#### Styling with Tailwind CSS

The library exports the core FFMA Tailwind theme and utility classes. To use Tailwind CSS with this library, ensure you have Tailwind installed configured in your project.
Then in your `globals.css` file you can import the FFMA Tailwind theme from the library as follows.

You can import the whole theme will all utility classes required for all of the components.

```css
@import 'ffma-dse-react-ui/styles/ffma-dse-react-ui.css';
```

Alternatively, the theme and utility classes are split over several files so that you can import only what you need.

```css
@import 'tailwindcss';

@import 'ffma-dse-react-ui/styles/typography.css';
@import 'ffma-dse-react-ui/styles/layout.css';
@import 'ffma-dse-react-ui/styles/shadows.css';
@import 'ffma-dse-react-ui/styles/primitive-colours.css';
@import 'ffma-dse-react-ui/styles/semantic-colours.css';
@import 'ffma-dse-react-ui/styles/dark-mode.css';
@import 'ffma-dse-react-ui/styles/core-resets.css';
@import 'ffma-dse-react-ui/styles/animations.css';
@import 'ffma-dse-react-ui/styles/scrollbar.css';
```

#### Fonts

The library includes the core FFMA fonts in the distribution. To use them you will need to ensure they are copied over to your app.

##### Plain React App (not Next.js)

If your application is a plain React app, you will need to ensure the fonts are copied over to the appropriate location in your build output so that they get served alongside your application.

You can then import the provided font face configuration into your applicaitons top level css file (e.g. `index.css` or `App.css`):

```css
@import 'ffma-dse-react-ui/styles/fonts.css';
```

##### Next.js Applications

If your application is a Next.js app, the library has a post install script that will automatically copy the fonts to the `public` directory in your next project.
You will then need to configure the fonts as per the next.js documentation using `next/font/local`.
**Important:** make sure you have the variable names of the three fonts as follows to ensure the Tailwind CSS classes work correctly:

- `--font-segoe-ui`
- `--font-aptos`
- `--font-aptos-mono`

Here is how you would configure the `Segoe UI` font in your Next.js application (you would need to add similar for the other two fonts as well)

```ts
// app/fonts.ts
import localFont from 'next/font/local'

export const segoeUi = localFont({
  variable: '--font-segoe-ui',
  src: [
    {
      path: '../public/fonts/segoeui/segoeui-light.ttf',
      weight: '100',
      style: 'normal',
    },
    // Add all the other weights and styles
    // ...
  ],
})
```

And then here is how you add the font classes to your Next.js application layout:

```tsx
// app/layout.tsx
import { segoeUi, aptos, aptosMono } from './fonts'
return (
  <html
    lang="en"
    suppressHydrationWarning
    className={`${segoeUi.variable} ${aptos.variable} ${aptosMono.variable} antialiased`}
  >
    // rest of the applicaiton layout
  </html>
)
```

## 📄 Documentation

Comprehensive documentation can be found in the following locations:

- **[Component Library (Stable)](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/stable/latest/)** - Production-ready components
- **[Component Library (Dev)](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/dev/latest/)** - Latest development features
- **[Package Registry](https://cloudsmith.io/~ffma/repos/npm/packages/detail/npm/ffma-dse-react-ui/)** - Version history and downloads

## 🛠️ Development

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10
- Access to FFMA Cloudsmith registry

### Setup

```bash
# Clone the repository
git clone https://github.com/FutureFundAgency/ffma-dse-react_ui.git
cd ffma-dse-react_ui

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev                  # Start Vite dev server
pnpm storybook            # Start Storybook

# Building
pnpm build                # Build library
pnpm build-storybook      # Build Storybook

# Testing
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm format               # Format with Prettier
pnpm type-check           # TypeScript type checking
```

### Project Structure

```
src/
├── components/           # React components
│   └── Button/
│       ├── button.tsx    # Component implementation
│       ├── Button.types.ts # TypeScript types
│       ├── button.test.tsx # Unit tests
│       └── button.stories.tsx # Storybook stories
├── styles/              # Global CSS and Tailwind
├── utils/               # Utility functions
└── index.ts             # Main library export
```

### Using Yalc for Local Development

[Yalc](https://github.com/wclr/yalc) is a tool that helps you develop and test your npm packages locally without publishing them to the npm registry. This is especially useful when you need to work on this library and a consuming project simultaneously.

#### Setup

1. Install yalc globally:

```bash
pnpm install -g yalc
```

2. In this library project (ffma-dse-react_ui), build and publish to yalc:

```bash
pnpm local:publish
```

3. In your consuming project, add the local version of the library:

```bash
yalc add ffma-dse-react-ui
pnpm install
```

#### Development Workflow

When you run the development server in this library, it will automatically watch for changes, rebuild, and update any linked projects:

```bash
pnpm dev
```

This command uses Vite's watch mode and our custom setup to:

1. Detect file changes in the library
2. Rebuild the package
3. Push changes to yalc
4. Update any linked consuming projects automatically

To manually publish new changes to yalc (when not running `pnpm dev`):

```bash
pnpm local:publish
```

#### Cleaning Up

When you're done with local development and want to switch back to using the published version:

1. In your consuming project, remove the yalc link:

```bash
yalc remove ffma-dse-react-ui
pnpm install
```

2. Optionally you can also remove the package from the local yalc registry by running this from the library project:

```bash
pnpm local:unpublish
```

## 🧪 Testing

We use Jest and React Testing Library for unit testing with 100% coverage requirement:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Testing Guidelines

- Write tests for all components
- Maintain 100% code coverage
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText, etc.)

## 📖 Storybook

Our component library is documented with Storybook in multiple environments:

- **[Development](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/dev/latest/)** - Latest features from main branch
- **[Stable](https://docserver.eng.ffma.cloud/ffma-dse-react_ui/storybook/stable/latest/)** - Production releases only

```bash
# Start Storybook locally
pnpm storybook

# Build Storybook for deployment
pnpm build-storybook
```

### Writing Stories

Each component should have comprehensive stories covering all variants:

```tsx
// button.stories.tsx
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
}
```

## 🚀 Release Process

### Automated Development Releases

Every successful PR merge to `main` automatically publishes a development version:

```bash
# Development versions follow the pattern:
# {LAST_RELEASE}-dev.{COMMITS_SINCE}.{SHORT_SHA}
npm install ffma-dse-react-ui@dev --registry https://npm.cloudsmith.io/ffma/npm/
```

### Manual Production Releases

1. Navigate to **Actions** → **Manual Release**
2. Enter version (e.g., "1.2.3") or leave empty for auto-increment
3. Select branch (usually "master")
4. Click **Run workflow**

The release process automatically:

- ✅ Validates version number
- ✅ Runs full CI suite (lint, test, build)
- ✅ Publishes to Cloudsmith registry
- ✅ Deploys Storybook to stable environment
- ✅ Creates GitHub release with auto-generated notes

### Version Strategy

- **Development:** `1.2.3-dev.5.abc1234` (auto-published on PR merge)
- **Production:** `1.2.3` (manual releases)
- **Semantic Versioning:** MAJOR.MINOR.PATCH

## 🤝 Contributing

### Development Workflow

1. **Create feature branch** from `main`
2. **Develop your component** with tests and stories
3. **Run quality checks** (`pnpm lint && pnpm test`)
4. **Open Pull Request** - CI will run automatically
5. **Merge** after review and all checks pass

### Component Guidelines

- Use TypeScript for all components
- Follow existing naming conventions
- Include comprehensive tests (100% coverage required)
- Write Storybook stories for all variants/states
- Use Tailwind CSS for styling
- Export types alongside components

### Code Style

We use automated formatting and linting:

- **ESLint** for code quality and consistency
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety
- **Tailwind CSS** for utility-first styling

## 📦 Publishing

### Registry Configuration

Packages are published to our private Cloudsmith registry:

```bash
# Configure npm registry
echo "@ffma:registry=https://npm.cloudsmith.io/ffma/npm/" >> ~/.npmrc

# Install latest stable
pnpm install ffma-dse-react-ui

# Install development version
pnpm install ffma-dse-react-ui@dev
```

### Quality Gates

All code must pass these quality gates before publishing:

- ✅ **ESLint** - No linting errors or warnings
- ✅ **TypeScript** - Strict type checking
- ✅ **Unit Tests** - 100% code coverage
- ✅ **Build** - Successful Vite build
- ✅ **Storybook** - All stories render correctly

## 🛡️ Infrastructure

### CI/CD Pipeline

- **GitHub Actions** for continuous integration
- **Self-hosted runners** for build performance
- **Automated testing** on every commit
- **Progressive deployment** (dev → stable)

### Hosting & Distribution

- **Cloudsmith** for npm package registry
- **AWS S3** for Storybook hosting
- **GitHub Pages** for API documentation
- **ArgoCD** for deployment orchestration

## 📄 License

Private license - Internal use only within the Future Fund Management Agency.

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/FutureFundAgency/ffma-dse-react_ui/issues)
- **Discussions:** [GitHub Discussions](https://github.com/FutureFundAgency/ffma-dse-react_ui/discussions)
- **Team Contact:** [@FutureFundAgency/ffma-data-engineering-leads](https://github.com/orgs/FutureFundAgency/teams/ffma-data-engineering-leads)

---

Built with ❤️ by the DSE Team

<!-- links -->

[pr-checks]: https://img.shields.io/badge/pr%20checks-4d4d4d?style=for-the-badge&logo=github-actions&logoColor=white 'Pull Request Checks'
[dev-publish]: https://img.shields.io/badge/dev%20publish-4d4d4d?style=for-the-badge&logo=npm&logoColor=white 'Development Publishing'
[manual-release]: https://img.shields.io/badge/manual%20release-4d4d4d?style=for-the-badge&logo=github&logoColor=white 'Manual Release Workflow'
[storybook-dev]: https://img.shields.io/badge/Storybook-DEV-FF4785?logo=storybook&logoColor=white 'Storybook Development Environment'
[storybook-stable]: https://img.shields.io/badge/Storybook-STABLE-FF4785?logo=storybook&logoColor=white 'Storybook Stable Environment'
[storybook-deploy]: https://github.com/FutureFundAgency/ffma-dse-react_ui/actions/workflows/storybook-deploy.yml/badge.svg 'Storybook Deploy Status'
[cloudsmith-latest]: https://img.shields.io/badge/npm-latest-CB3837?logo=npm&logoColor=white 'Latest NPM Version'
[cloudsmith-dev]: https://img.shields.io/badge/npm-dev-orange?logo=npm&logoColor=white 'Development NPM Version'
[coverage-status]: https://img.shields.io/badge/coverage-100%25-brightgreen?logo=jest&logoColor=white 'Test Coverage'
[typescript-status]: https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white 'TypeScript Version'
[lint-status]: https://img.shields.io/badge/linting-ESLint%20%7C%20Prettier-blueviolet?logo=eslint&logoColor=white 'Code Quality'

<!-- links -->

.