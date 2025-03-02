# Root directory
$root = "maturity-models"

# Directories and files to create
$structure = @(
    "$root/client/public",
    "$root/client/src/api",
    "$root/client/src/assets",
    "$root/client/src/components/common",
    "$root/client/src/components/admin",
    "$root/client/src/components/catalog",
    "$root/client/src/components/dashboard",
    "$root/client/src/components/evaluation",
    "$root/client/src/contexts",
    "$root/client/src/hooks",
    "$root/client/src/layouts",
    "$root/client/src/models",
    "$root/client/src/pages",
    "$root/client/src/routes",
    "$root/client/src/services",
    "$root/client/src/store",
    "$root/client/src/utils",
    "$root/server/src/config",
    "$root/server/src/controllers",
    "$root/server/src/db",
    "$root/server/src/entities",
    "$root/server/src/middlewares",
    "$root/server/src/repositories",
    "$root/server/src/routes",
    "$root/server/src/services",
    "$root/server/src/types",
    "$root/server/src/utils"
)

# Create directories
foreach ($dir in $structure) {
    New-Item -ItemType Directory -Force -Path $dir
}

# Create files
$files = @(
    "$root/client/src/App.tsx",
    "$root/client/src/index.tsx",
    "$root/client/src/theme.ts",
    "$root/client/package.json",
    "$root/client/tsconfig.json",
    "$root/server/src/app.ts",
    "$root/server/src/index.ts",
    "$root/server/package.json",
    "$root/server/tsconfig.json",
    "$root/.gitignore",
    "$root/README.md",
    "$root/package.json"
)

foreach ($file in $files) {
    New-Item -ItemType File -Force -Path $file
}

Write-Output "Directory structure created successfully!"
