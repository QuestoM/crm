# Testing Strategy

## Overview

This testing strategy aims to achieve >90% test coverage while ensuring the quality and reliability of the CRM system. The strategy incorporates multiple testing levels and methodologies to comprehensively validate the application.

## Test Types

### 1. Unit Testing

**Target Coverage: 95%**

- **Scope**: Individual functions, hooks, and utilities
- **Tools**: Jest, React Testing Library
- **Approach**:
  - Test all utility functions with multiple input combinations
  - Test custom hooks with renderHook
  - Mock external dependencies
  - Use snapshot testing sparingly and only for stable components

**Example Unit Test**:
```typescript
// src/modules/leads/services/leadService.test.ts
import { validateLeadData } from './leadService';

describe('validateLeadData', () => {
  it('should return true for valid lead data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+972501234567',
    };
    expect(validateLeadData(validData)).toBe(true);
  });

  it('should return false for invalid email', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '+972501234567',
    };
    expect(validateLeadData(invalidData)).toBe(false);
  });
});
```

### 2. Integration Testing

**Target Coverage: 90%**

- **Scope**: Module interactions, API endpoints, database operations
- **Tools**: Jest, Supertest, Supabase Local Development
- **Approach**:
  - Test API endpoints with mocked authentication
  - Test database operations against a test database
  - Verify module interactions

**Example Integration Test**:
```typescript
// src/modules/leads/api/createLead.test.ts
import { createMocks } from 'node-mocks-http';
import createLeadHandler from './createLead';
import { supabaseClient } from '../../../services/supabase/client';

jest.mock('../../../services/supabase/client');

describe('Create Lead API', () => {
  it('should create a lead successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+972501234567',
        utmSource: 'google',
      },
    });

    // Mock Supabase response
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: { id: '123', ...req.body },
          error: null,
        }),
      }),
    });

    await createLeadHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toHaveProperty('id');
  });
});
```

### 3. UI Component Testing

**Target Coverage: 90%**

- **Scope**: React components
- **Tools**: React Testing Library, Jest
- **Approach**:
  - Test component rendering with various props
  - Test user interactions
  - Test RTL layout handling
  - Verify component accessibility

**Example Component Test**:
```typescript
// src/modules/leads/components/LeadForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('should render all form fields', () => {
    render(<LeadForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/שם פרטי/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/שם משפחה/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/דוא"ל/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/טלפון/i)).toBeInTheDocument();
  });

  it('should validate form fields on submit', async () => {
    const mockSubmit = jest.fn();
    render(<LeadForm onSubmit={mockSubmit} />);
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /שמור/i }));
    
    // Check for validation messages
    expect(screen.getByText(/שדה חובה/i)).toBeInTheDocument();
    
    // Verify the form wasn't submitted
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### 4. End-to-End Testing

**Target Coverage: 85%**

- **Scope**: Complete user flows
- **Tools**: Cypress
- **Approach**:
  - Test critical business flows end-to-end
  - Test across different viewports
  - Test RTL layout across the application

**Example E2E Test**:
```typescript
// cypress/integration/lead-creation.spec.ts
describe('Lead Creation', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
    cy.visit('/leads/create');
  });

  it('should create a new lead', () => {
    // Fill lead form
    cy.get('input[name="firstName"]').type('ישראל');
    cy.get('input[name="lastName"]').type('ישראלי');
    cy.get('input[name="email"]').type('israel@example.com');
    cy.get('input[name="phone"]').type('0501234567');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify success message
    cy.contains('הליד נוצר בהצלחה').should('be.visible');
    
    // Verify lead appears in list
    cy.visit('/leads');
    cy.contains('ישראל ישראלי').should('be.visible');
  });
});
```

### 5. Performance Testing

**Target Coverage: Key operations**

- **Scope**: API response times, page load times
- **Tools**: Lighthouse, custom performance monitoring
- **Approach**:
  - Measure API response times for critical operations
  - Test page load performance for data-heavy pages
  - Set performance budgets for key metrics

### 6. Accessibility Testing

**Target Coverage: All UI components**

- **Scope**: Accessibility compliance
- **Tools**: axe-core, Lighthouse
- **Approach**:
  - Test keyboard navigation
  - Verify screen reader compatibility
  - Ensure color contrast meets WCAG guidelines
  - Test with RTL layout

## Test Automation & CI/CD

- **Repository**: GitHub
- **CI/CD Tool**: GitHub Actions
- **Test Execution**:
  - Run unit and integration tests on every pull request
  - Run E2E tests on staging deployments
  - Run performance and accessibility tests nightly

**Example GitHub Actions Workflow**:
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type checking
        run: npm run type-check
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Acceptance Criteria

All features must satisfy the following criteria before release:

1. Unit test coverage ≥ 95%
2. Integration test coverage ≥ 90%
3. All E2E tests pass
4. Performance metrics within established budgets
5. No accessibility violations
6. Successful RTL layout rendering on all screen sizes
7. Hebrew text and numbers display correctly
8. Successful validation of Hebrew inputs

## Test Environment

- **Development**: Local Supabase instance, mocked external services
- **Staging**: Dedicated Supabase project, test accounts for external services
- **Production**: Production Supabase project with isolated test data

## Test Data Management

- Generate realistic test data with Faker.js
- Create predefined test scenarios
- Implement data cleanup routines
- Maintain separate test data for each environment
