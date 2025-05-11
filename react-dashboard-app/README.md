# Water Filter CRM System

A comprehensive CRM system for water filter and water bar companies, with full Hebrew language support and RTL layout.

## Features

- **Lead Management:** Capture and track leads with UTM parameters and conversion history
- **Customer Management:** Unified customer database with comprehensive history tracking
- **Product & Package Management:** Catalog of products and customizable packages
- **Sales & Invoicing:** Purchase tracking and invoice generation
- **Service Management:** Technician scheduling and service appointment tracking
- **Inventory Management:** Stock tracking with low inventory alerts
- **Reporting & Analytics:** Sales dashboards and customer acquisition metrics

## Architecture

The system follows a modular architecture with clear separation of concerns:

- **Domain Layer:** Business rules and data models
- **Repository Layer:** Data access with Supabase
- **Service Layer:** Business logic and integration with external systems
- **API Layer:** RESTful API endpoints

## Prerequisites

- Node.js 16+
- NPM or Yarn
- Supabase account (free tier is sufficient for testing)
- MCP (Model Context Protocol) support

## Setup and Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Initialize the database and run the MCP server:**

```bash
npm run setup-db
```

This command will:
- Connect to your Supabase database
- Create the necessary tables based on our schema
- Add sample data for testing
- Start the MCP server for Supabase

3. **Run just the MCP server:**

```bash
npm run mcp
```

4. **View the dashboard:**

```bash
npm run serve-dashboard
```

This will start a local server and open the dashboard in your browser.

## Project Structure

```
/src
  /modules                 # Business domain modules
    /leads                 # Lead management module
    /customers             # Customer management module
    /products              # Product & package management module
    /...                   # Other modules
  /services                # Shared services
    /supabase              # Supabase integration
    /queue                 # Asynchronous task processing
    /config                # Application configuration
  /shared                  # Shared utilities and components
```

## Database Schema

The database schema is defined in `setup-database.sql` and includes tables for:

- Leads
- Customers
- Products
- Packages
- Orders
- Invoices
- Technicians
- Service appointments
- And more...

## Using the MCP Server

The MCP (Model Context Protocol) server provides a way to connect to the Supabase database. The configuration is stored in `.cursor/mcp.json`.

When you run `npm run mcp` or `npm run setup-db`, the MCP server uses the connection string from this file to connect to Supabase.

## Dashboard

The system includes a simple dashboard (`dashboard.html`) that connects directly to Supabase to display:

- Key metrics (leads, customers, products, orders)
- Recent leads
- Recent customers
- Product catalog

## API Endpoints

The API follows RESTful principles. Examples of available endpoints:

- `GET /api/leads` - List all leads
- `GET /api/leads/{id}` - Get a specific lead
- `POST /api/leads` - Create a new lead
- `PUT /api/leads/{id}` - Update a lead
- `DELETE /api/leads/{id}` - Delete a lead

Similar endpoints exist for customers, products, packages, etc.

## License

This project is licensed under the ISC License. 