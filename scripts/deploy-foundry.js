const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '../packages/foundry-module');
const TARGET = 'E:\\foundry_v13\\data\\Data\\modules\\warhammer-mcp';

// Helper function to copy directory recursively using built-in fs
function copyDirSync(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read all files/folders in source
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deploy() {
  console.log('🚀 Deploying Foundry module...');
  console.log(`   Source: ${SOURCE}`);
  console.log(`   Target: ${TARGET}`);

  try {
    // Ensure target directory exists
    if (!fs.existsSync(TARGET)) {
      fs.mkdirSync(TARGET, { recursive: true });
    }

    // Copy critical files/folders
    const itemsToCopy = [
      'dist',           // Compiled JavaScript
      'lang',           // Localization
      'styles',         // CSS
      'templates',      // Handlebars
      'scripts',        // Additional scripts
      'module.json',    // Manifest
    ];

    for (const item of itemsToCopy) {
      const srcPath = path.join(SOURCE, item);
      const destPath = path.join(TARGET, item);

      if (fs.existsSync(srcPath)) {
        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
          copyDirSync(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }

        console.log(`   ✅ Copied ${item}`);
      }
    }

    console.log('✨ Deployment complete!');
    console.log('⚠️  Remember to refresh Foundry VTT (F5) to load changes');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
