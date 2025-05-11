# File Structure

```
/src
  /modules                 # Business domain modules
    /leads
      /domain              # Domain types and business rules
        types.ts
        validation.ts
        constants.ts
      /repositories        # Data access layer
        leadRepository.ts
        queries.ts
      /services            # Business logic
        leadService.ts
        leadConversionService.ts
      /hooks               # React custom hooks
        useLeads.ts
        useLeadForm.ts
      /components          # UI components
        LeadList.tsx
        LeadForm.tsx
        LeadStatusBadge.tsx
      /api                 # API endpoints
        getLeads.ts
        createLead.ts
        updateLead.ts
      index.ts             # Public module API
    
    /customers             # Similar structure to leads
    /products              # Similar structure to leads
    /packages              # Similar structure to leads
    /sales
    /invoices
    /journey               # Customer journey automation
    /technicians
    /appointments
    /inventory
    /documents
    /analytics
    /warranties
  
  /shared                  # Shared utilities and components
    /ui                    # Shared UI components
      /layout
        RtlLayout.tsx
        Container.tsx
        PageHeader.tsx
      /forms
        Input.tsx
        Select.tsx
        DatePicker.tsx
      /feedback
        Alert.tsx
        Toast.tsx
      /data
        Table.tsx
        DataGrid.tsx
      /navigation
        Navbar.tsx
        Sidebar.tsx
        Breadcrumbs.tsx
    
    /utils                 # Utility functions
      /date
        formatters.ts
        calculators.ts
      /validation
        validators.ts
        schemas.ts
      /formatting
        currency.ts
        phoneNumber.ts
      i18n.ts              # Internationalization utilities
      rtl.ts               # RTL support utilities
    
    /hooks                 # Shared custom hooks
      useForm.ts
      useQuery.ts
      useMutation.ts
      useAuth.ts
      useNotification.ts
    
    /api                   # API utilities
      client.ts
      errorHandling.ts
      types.ts
    
    /contexts              # React contexts
      AuthContext.tsx
      NotificationContext.tsx
      SettingsContext.tsx
  
  /pages                   # Next.js pages
    /leads
      index.tsx
      [id].tsx
      create.tsx
    /customers
      index.tsx
      [id].tsx
      create.tsx
    /products
    /packages
    /sales
    /appointments
    /technicians
    /inventory
    /documents
    /analytics
    /settings
    _app.tsx
    _document.tsx
    index.tsx
  
  /services                # External service integrations
    /supabase
      client.ts
      auth.ts
      storage.ts
    /email
      emailService.ts
    /sms
      smsService.ts
    /payment
      paymentService.ts
  
  /styles                  # Global styles
    globals.css
    variables.css
    rtl.css
  
  /public                  # Static assets
    /locales               # i18n translation files
      /he
        common.json
        leads.json
        customers.json
    /images
    /fonts
```
