function Commit-Module {
    param(
        [string]$Path,
        [string]$Message
    )
    # Split paths if there are spaces
    $Paths = $Path -split ' '
    foreach ($p in $Paths) {
        if ($p) {
            git add $p
        }
    }
    
    $status = git diff --cached --name-only
    if ($status) {
        git commit -m "$Message"
    }
}

# Backend Configurations & Global files
Commit-Module "backend/package.json backend/package-lock.json backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json backend/eslint.config.mjs backend/skills-lock.json backend/prisma.config.ts" "chore(backend): add project configuration"
Commit-Module "backend/src/main.ts backend/src/app.module.ts backend/src/app.controller.ts backend/src/app.service.ts backend/src/app.controller.spec.ts backend/test" "feat(backend): add app entry point and base module"

# Backend Core Modules
Commit-Module "backend/src/prisma" "feat(backend): add prisma database module"
Commit-Module "backend/prisma" "feat(backend): add prisma schema and seeds"

# Backend Feature Modules
Commit-Module "backend/src/auth" "feat(backend): add auth module"
Commit-Module "backend/src/users" "feat(backend): add users module"
Commit-Module "backend/src/brands" "feat(backend): add brands module"
Commit-Module "backend/src/categories" "feat(backend): add categories module"
Commit-Module "backend/src/customers" "feat(backend): add customers module"
Commit-Module "backend/src/suppliers" "feat(backend): add suppliers module"
Commit-Module "backend/src/units" "feat(backend): add units module"
Commit-Module "backend/src/products" "feat(backend): add products module"
Commit-Module "backend/src/purchases" "feat(backend): add purchases module"
Commit-Module "backend/src/sales" "feat(backend): add sales module"
Commit-Module "backend/src/expense-categories" "feat(backend): add expense categories module"
Commit-Module "backend/src/payment-modes" "feat(backend): add payment modes module"
Commit-Module "backend/src/dashboard" "feat(backend): add dashboard module"

# Any remaining backend source files
Commit-Module "backend" "chore(backend): add remaining files"

# Frontend Configurations & Global files
Commit-Module "frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/tsconfig.app.json frontend/vite.config.ts frontend/.oxlintrc.json frontend/.gitignore frontend/README.md frontend/.env frontend/*.cjs" "chore(frontend): add project configuration"
Commit-Module "frontend/public frontend/src/assets frontend/src/index.css frontend/src/App.css" "feat(frontend): add global styles and assets"
Commit-Module "frontend/src/main.tsx frontend/src/App.tsx" "feat(frontend): add app entry point"

# Frontend Core Modules
Commit-Module "frontend/src/api.ts frontend/src/services" "feat(frontend): add api services"
Commit-Module "frontend/src/routes" "feat(frontend): add routing"
Commit-Module "frontend/src/layouts" "feat(frontend): add layout components"
Commit-Module "frontend/src/components" "feat(frontend): add shared components"

# Frontend Feature Pages
Commit-Module "frontend/src/pages/auth" "feat(frontend): add auth pages"
Commit-Module "frontend/src/pages/dashboard" "feat(frontend): add dashboard page"
Commit-Module "frontend/src/pages/master" "feat(frontend): add master data pages"
Commit-Module "frontend/src/pages/inventory" "feat(frontend): add inventory pages"
Commit-Module "frontend/src/pages/purchase" "feat(frontend): add purchase pages"
Commit-Module "frontend/src/pages/sales" "feat(frontend): add sales pages"
Commit-Module "frontend/src/pages/expenses" "feat(frontend): add expenses pages"
Commit-Module "frontend/src/pages/reports" "feat(frontend): add reports pages"

# Any remaining frontend source files
Commit-Module "frontend" "chore(frontend): add remaining files"

# Any remaining root files
Commit-Module "." "chore: add remaining root files"
