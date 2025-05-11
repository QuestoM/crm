#!/usr/bin/env node

const { execSync } = require('child_process');
const { format } = require('date-fns');

// Function to get current timestamp in format: YYYY-MM-DD_HH-mm-ss
function getTimestamp() {
  return format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
}

// Function to execute shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null; // Return null instead of exiting to allow for better error handling
  }
}

// Function to check if there are changes to commit
function hasChangesToCommit() {
  const status = runCommand('git status --porcelain');
  return status && status.trim().length > 0;
}

// Function to get the current branch name
function getCurrentBranch() {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branchName;
  } catch (error) {
    console.error('Error getting current branch name, defaulting to "main"');
    return 'main';
  }
}

async function publishToGithub() {
  // Get timestamp for versioning
  const timestamp = getTimestamp();
  
  console.log('\n🚀 Starting GitHub publishing process...');
  
  // Check git status
  console.log('\n📊 Checking git status...');
  runCommand('git status');
  
  // Get current branch name
  const currentBranch = getCurrentBranch();
  console.log(`\n🌿 Current branch: ${currentBranch}`);
  
  // Stage all changes
  console.log('\n📦 Staging all changes...');
  runCommand('git add .');
  
  // Check if there are changes to commit
  if (hasChangesToCommit()) {
    // Commit with timestamp
    console.log('\n💾 Committing changes...');
    runCommand(`git commit -m "Version ${timestamp}"`);
    
    // Create a tag with the timestamp
    console.log('\n🏷️ Creating tag...');
    runCommand(`git tag v${timestamp}`);
  } else {
    console.log('\n📝 No changes to commit. Creating an empty commit for versioning...');
    // Create an empty commit with allow-empty flag
    runCommand(`git commit --allow-empty -m "Version ${timestamp} (no changes)"`);
    
    // Create a tag with the timestamp
    console.log('\n🏷️ Creating tag...');
    runCommand(`git tag v${timestamp}`);
  }
  
  // Push changes to remote repository
  console.log(`\n☁️ Pushing to remote repository (branch: ${currentBranch})...`);
  const pushResult = runCommand(`git push origin ${currentBranch}`);
  
  if (pushResult === null) {
    console.log('\n⚠️ Failed to push to remote. Attempting to set upstream branch...');
    runCommand(`git push --set-upstream origin ${currentBranch}`);
  }
  
  // Push tags to remote repository
  console.log('\n🏷️ Pushing tags...');
  runCommand('git push origin --tags');
  
  console.log(`\n✅ Successfully published version v${timestamp} to GitHub!`);
}

// Execute the function
publishToGithub().catch(error => {
  console.error('Failed to publish to GitHub:', error);
  process.exit(1);
}); 