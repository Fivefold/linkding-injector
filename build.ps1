# Update dependencies
npm install

# Run rollup build
npm run build

# Lint extension, while excluding dev files
npx web-ext lint --ignore-files .idea dist docs src web-ext-artifacts scss .gitignore *.sh *.ps1 *.iml *.js *.lock
# Build extension, while excluding dev files
npx web-ext build --overwrite-dest --ignore-files .idea dist docs src web-ext-artifacts scss .gitignore *.sh *.ps1 *.iml *.js *.lock

echo "✅ Done"
