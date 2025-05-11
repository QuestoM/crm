# Water Filter CRM

A comprehensive CRM system for water filter business with Hebrew language support.

## Features

- Customer management
- Lead tracking and conversion
- Product catalog
- Order management
- Inventory tracking
- Warranty management

## Getting Started

1. Run `start.bat` to launch the application
2. Application will connect to Supabase automatically

## System Requirements

- Windows 10 or newer
- Node.js 14 or newer

## GitHub Publishing

This project includes an automated publishing script that pushes changes to GitHub with a timestamp-based version:

### Using the Script

**Method 1: Complete setup and publishing (recommended for first-time setup)**
```
setup-git-and-publish.bat
```
This script will:
1. Install required dependencies
2. Initialize Git repository if needed
3. Configure Git user if needed
4. Set up GitHub remote repository
5. Create initial commit if needed
6. Run the publishing script

**Method 2: Using the batch file (if Git is already set up)**
```
publish-to-github.bat
```

**Method 3: Using npm**
```
npm run publish
```

**Method 4: Directly with Node.js**
```
node publish-to-github.js
```

The publishing script will:
1. Stage all changed files
2. Commit with the current timestamp
3. Create a tag with the timestamp (format: yyyy-MM-dd_HH-mm-ss)
4. Push changes and tags to GitHub

### Requirements
- Git must be installed on your system
- GitHub account with a repository for this project
