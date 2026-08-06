# SwiftHR - Folder Structure

## Project Root Structure

```
Swift-HR/
├── frontend/                 # React TypeScript application
├── backend/                  # Django REST Framework application
├── docs/                     # Project documentation
├── scripts/                  # Utility scripts
├── docker/                   # Docker configurations
├── .github/                  # GitHub workflows and templates
├── .gitignore
├── README.md
├── LICENSE
└── docker-compose.yml        # Local development orchestration
```

**Rationale**: Monorepo structure allows coordinated development of frontend and backend while maintaining clear separation. Shared scripts and configurations are at the root for easy access.

## Frontend Structure

### Root Level

```
frontend/
├── public/                   # Static assets
├── src/                      # Source code
├── .eslintrc.cjs            # ESLint configuration
├── .prettierrc              # Prettier configuration
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node.js
├── vite.config.ts           # Vite build configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

### Source Code Structure

```
src/
├── main.tsx                 # Application entry point
├── App.tsx                  # Root component
├── index.css                # Global styles
├── vite-env.d.ts           # Vite type definitions
│
├── assets/                  # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── features/                # Feature-based modules
│   ├── auth/               # Authentication feature
│   ├── applications/       # Application management
│   ├── dashboard/          # Dashboard feature
│   ├── profile/            # User profile feature
│   └── shared/             # Shared features
│
├── layout/                 # Layout components
│   ├── components/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── Layout/
│   └── hooks/
│
├── shared/                 # Shared utilities and components
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Application constants
│   └── config/             # Configuration files
│
├── store/                  # Redux store configuration
│   ├── index.ts
│   ├── rootReducer.ts
│   ├── middleware/
│   └── slices/             # Redux slices
│
├── services/               # API services
│   ├── api.ts              # Axios configuration
│   ├── authApi.ts          # Authentication API
│   ├── applicationsApi.ts  # Applications API
│   └── endpoints/          # API endpoint definitions
│
├── router/                 # React Router configuration
│   ├── index.tsx
│   ├── routes.tsx
│   └── guards/             # Route guards
│
└── styles/                 # Global styles and themes
    ├── globals.css
    ├── variables.css       # CSS variables
    └── themes/             # Theme definitions
```

### Feature Module Structure

Each feature module follows a consistent structure:

```
features/auth/
├── components/             # Feature-specific components
│   ├── LoginForm/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── index.ts
│   ├── RegisterForm/
│   ├── ForgotPassword/
│   └── OTPVerification/
├── hooks/                  # Feature-specific hooks
│   ├── useAuth.ts
│   ├── useLogin.ts
│   └── useLogout.ts
├── services/               # Feature-specific services
│   └── authService.ts
├── types/                  # Feature-specific types
│   └── auth.types.ts
├── utils/                  # Feature-specific utilities
│   └── auth.utils.ts
├── constants/              # Feature-specific constants
│   └── auth.constants.ts
└── index.ts                # Feature exports
```

**Rationale**: Feature-based structure organizes code by business domain, making it easier to find, maintain, and scale features. Each feature is self-contained with its own components, hooks, and services.

### Shared Components Structure

```
shared/components/
├── ui/                     # shadcn/ui components
│   ├── button/
│   ├── input/
│   ├── card/
│   ├── dialog/
│   ├── dropdown/
│   └── ...
├── layout/                 # Layout components
│   ├── Container/
│   ├── Grid/
│   └── Flex/
├── feedback/               # Feedback components
│   ├── Toast/
│   ├── Alert/
│   └── Spinner/
├── data-display/           # Data display components
│   ├── Table/
│   ├── Badge/
│   └── Progress/
└── navigation/             # Navigation components
    ├── Breadcrumb/
    ├── Tabs/
    └── Pagination/
```

**Rationale**: Shared components are organized by function, making them easy to discover and reuse. shadcn/ui components are kept separate to manage updates easily.

### Redux Store Structure

```
store/
├── index.ts                # Store configuration
├── rootReducer.ts          # Root reducer combining all slices
├── middleware/
│   ├── logger.ts           # Logging middleware
│   └── apiMiddleware.ts    # API middleware
└── slices/
    ├── authSlice.ts        # Authentication state
    ├── uiSlice.ts          # UI state (modals, toasts)
    ├── userSlice.ts        # User state
    └── applicationsSlice.ts # Applications state
```

**Rationale**: Redux Toolkit simplifies state management. Slices are organized by domain, and middleware handles cross-cutting concerns like logging and API calls.

## Backend Structure

### Root Level

```
backend/
├── apps/                   # Django applications
├── core/                   # Core configuration
├── common/                 # Common utilities
├── utils/                  # Utility functions
├── static/                 # Static files
├── media/                  # User uploaded files
├── locale/                 # Internationalization
├── templates/              # Django templates (if needed)
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── requirements-dev.txt    # Development dependencies
├── .env.example            # Environment variables template
├── .gitignore
├── README.md
└── pytest.ini              # Pytest configuration
```

### Django Apps Structure

```
apps/
├── authentication/         # Authentication app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── services.py         # Business logic
│   ├── repositories.py     # Data access layer
│   ├── permissions.py      # Custom permissions
│   ├── filters.py          # Query filters
│   ├── tests/
│   │   ├── test_models.py
│   │   ├── test_views.py
│   │   └── test_services.py
│   └── migrations/
│
├── applications/           # Applications management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── services.py
│   ├── repositories.py
│   ├── permissions.py
│   ├── filters.py
│   ├── tasks.py            # Celery tasks
│   ├── tests/
│   └── migrations/
│
├── users/                  # User management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── services.py
│   ├── repositories.py
│   ├── permissions.py
│   ├── tests/
│   └── migrations/
│
└── dashboard/              # Dashboard analytics
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── admin.py
    ├── apps.py
    ├── services.py
    ├── repositories.py
    ├── tests/
    └── migrations/
```

**Rationale**: Django apps are organized by business domain. Each app contains models, serializers, views, and business logic, following Django conventions while adding service and repository layers for better architecture.

### Core Configuration Structure

```
core/
├── config/
│   ├── settings.py        # Main settings
│   ├── settings/
│   │   ├── base.py        # Base settings
│   │   ├── development.py # Development settings
│   │   ├── production.py  # Production settings
│   │   └── test.py        # Test settings
│   ├── urls.py            # Main URL configuration
│   ├── wsgi.py            # WSGI configuration
│   ├── asgi.py            # ASGI configuration
│   └── celery.py          # Celery configuration
│
├── permissions.py          # Global permissions
├── pagination.py          # Custom pagination
├── filters.py              # Global filters
├── exceptions.py           # Custom exceptions
├── middleware.py           # Custom middleware
└── validators.py           # Custom validators
```

**Rationale**: Settings are split by environment for better configuration management. Core utilities and configurations are centralized for easy maintenance.

### Common Utilities Structure

```
common/
├── models.py               # Abstract base models
├── serializers.py          # Base serializers
├── mixins.py               # Model mixins
├── repositories.py         # Base repository classes
├── permissions.py          # Base permission classes
├── pagination.py           # Custom pagination classes
└── constants.py            # Common constants
```

**Rationale**: Common utilities provide reusable functionality across apps, reducing code duplication and ensuring consistency.

### Utils Structure

```
utils/
├── email.py                # Email utilities
├── storage.py              # File storage utilities
├── helpers.py              # Helper functions
├── validators.py           # Custom validators
├── decorators.py           # Custom decorators
├── formatters.py           # Data formatters
└── security.py             # Security utilities
```

**Rationale**: Utility functions are organized by function, making them easy to find and use across the application.

## Documentation Structure

```
docs/
├── 01-project-overview.md
├── 02-functional-requirements.md
├── 03-non-functional-requirements.md
├── 04-ui-design-analysis.md
├── 05-system-architecture.md
├── 06-folder-structure.md
├── 07-api-design.md
├── 08-database-design.md
├── 09-development-roadmap.md
├── 10-devin-prompts.md
├── api/                    # API documentation
│   ├── endpoints/
│   └── schemas/
├── guides/                 # User guides
├── deployment/             # Deployment guides
└── diagrams/               # Architecture diagrams
```

**Rationale**: Documentation is organized by type and purpose. API documentation is separate for auto-generation, and guides provide practical information for users and developers.

## Scripts Structure

```
scripts/
├── setup.sh                # Initial setup script
├── dev.sh                  # Development environment setup
├── test.sh                 # Test runner script
├── build.sh                # Build script
├── deploy.sh               # Deployment script
├── db/
│   ├── backup.sh           # Database backup
│   ├── restore.sh          # Database restore
│   └── migrate.sh          # Database migration
└── utils/
    ├── lint.sh             # Linting script
    └── format.sh           # Code formatting
```

**Rationale**: Scripts automate common development and deployment tasks, ensuring consistency and reducing human error.

## Docker Structure

```
docker/
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── entrypoint.sh
├── postgres/
│   └── init.sql
├── redis/
│   └── redis.conf
└── nginx/
    └── nginx.conf
```

**Rationale**: Docker configurations are organized by service, enabling containerized development and deployment. Separate development and production configurations optimize for each environment.

## GitHub Structure

```
.github/
├── workflows/
│   ├── ci.yml              # Continuous integration
│   ├── cd.yml              # Continuous deployment
│   ├── security.yml        # Security scanning
│   └── test.yml            # Automated testing
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
└── PULL_REQUEST_TEMPLATE.md
```

**Rationale**: GitHub workflows automate CI/CD processes. Issue and PR templates ensure consistent communication and reduce setup time for contributors.

## Configuration Files

### Root Configuration Files

```
Swift-HR/
├── .gitignore              # Git ignore rules
├── .editorconfig           # Editor configuration
├── .prettierrc             # Prettier configuration
├── .eslintrc.cjs           # ESLint configuration
├── docker-compose.yml      # Docker Compose configuration
├── docker-compose.dev.yml  # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── Makefile                # Make commands
└── README.md               # Project documentation
```

**Rationale**: Configuration files at the root provide project-wide settings and convenience commands for common operations.

## Testing Structure

### Frontend Testing

```
frontend/src/
├── __tests__/              # Global test setup
│   ├── setup.ts
│   └── mocks/
├── features/
│   └── auth/
│       ├── components/
│       │   └── LoginForm/
│       │       ├── LoginForm.test.tsx
│       │       └── LoginForm.stories.tsx
│       └── hooks/
│           └── useAuth.test.ts
└── shared/
    └── components/
        └── ui/
            └── button/
                └── Button.test.tsx
```

### Backend Testing

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # Pytest configuration
│   ├── factories/          # Test factories
│   ├── fixtures/           # Test fixtures
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
└── apps/
    └── authentication/
        └── tests/
            ├── test_models.py
            ├── test_views.py
            └── test_services.py
```

**Rationale**: Tests are co-located with the code they test for easy discovery. Separate test types (unit, integration, e2e) provide different levels of confidence.

## Environment Files

```
backend/
├── .env.example            # Environment variables template
├── .env.development         # Development environment
├── .env.test               # Test environment
└── .env.production         # Production environment (not committed)

frontend/
├── .env.example            # Environment variables template
├── .env.development         # Development environment
├── .env.test               # Test environment
└── .env.production         # Production environment (not committed)
```

**Rationale**: Environment-specific configurations enable different settings for development, testing, and production. Example files serve as templates for developers.

## Asset Management

### Frontend Assets

```
frontend/src/assets/
├── images/
│   ├── logo.svg
│   ├── icons/
│   └── illustrations/
├── fonts/
│   ├── Inter-Regular.woff2
│   └── Inter-Medium.woff2
└── icons/
    ├── lucide/             # Lucide icons
    └── custom/             # Custom icons
```

### Backend Assets

```
backend/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── media/
    ├── uploads/
    │   ├── documents/
    │   ├── avatars/
    │   └── temporary/
    └── processed/
```

**Rationale**: Frontend assets are organized by type for efficient bundling. Backend media files are organized by upload type and processing status.

## Build and Distribution

### Frontend Build Output

```
frontend/
├── dist/                   # Production build output
│   ├── assets/
│   ├── index.html
│   └── ...
└── build/                  # Development build output
```

### Backend Distribution

```
backend/
├── dist/                   # Distribution package
│   ├── swifthr/
│   └── requirements.txt
└── wheelhouse/             # Python wheels
```

**Rationale**: Build outputs are separated from source code to keep the repository clean. Distribution packages are ready for deployment.

## Internationalization

```
backend/locale/
├── en/
│   └── LC_MESSAGES/
│       └── django.po
└── fr/
    └── LC_MESSAGES/
        └── django.po

frontend/src/i18n/
├── en.json
├── fr.json
└── index.ts
```

**Rationale**: Internationalization files are organized by language, making it easy to add new languages and manage translations.

## Logging Structure

```
backend/logs/
├── application.log
├── error.log
├── access.log
└── celery.log
```

**Rationale**: Logs are separated by type for easier monitoring and debugging. Log rotation should be configured to manage file sizes.

## Temporary Files

```
backend/tmp/
├── uploads/               # Temporary file uploads
├── cache/                 # Temporary cache files
└── sessions/              # Temporary session files
```

**Rationale**: Temporary files are isolated in a dedicated directory that can be cleaned regularly without affecting application data.

## Backup and Migration

```
backups/
├── database/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
└── media/
    └── uploads/
```

**Rationale**: Backups are organized by type and frequency, enabling efficient backup strategies and easy restoration when needed.

## Conclusion

This folder structure provides a comprehensive organization for the SwiftHR project, balancing separation of concerns with developer convenience. The structure is designed to:

1. **Scale**: Accommodate growth in features and team size
2. **Maintain**: Make code easy to find, understand, and modify
3. **Test**: Support comprehensive testing strategies
4. **Deploy**: Enable automated deployment pipelines
5. **Collaborate**: Facilitate team collaboration with clear boundaries

The structure follows industry best practices while adapting to the specific needs of the SwiftHR application, ensuring long-term maintainability and developer productivity.