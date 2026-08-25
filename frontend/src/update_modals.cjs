const fs = require('fs');
const path = require('path');

const files = [
  'Brands.tsx',
  'Categories.tsx',
  'Customers.tsx',
  'ExpenseCategories.tsx',
  'PaymentModes.tsx',
  'PaymentTypes.tsx',
  'Suppliers.tsx',
  'Units.tsx'
];

const basePath = 'd:/Pos-Suite360/frontend/src/pages/master';

files.forEach(file => {
  const filePath = path.join(basePath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add import
  if (!content.includes('DeleteConfirmationModal')) {
    content = content.replace(
      "import api from '../../services/api';",
      "import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';\nimport api from '../../services/api';"
    );
  }

  // 2. Add state
  if (!content.includes('itemToDelete')) {
    content = content.replace(
      "const queryClient = useQueryClient();",
      "const queryClient = useQueryClient();\n  const [itemToDelete, setItemToDelete] = useState<any>(null);"
    );
  }

  // 3. Update window.confirm (find the variable name being deleted, e.g., brand, category, etc.)
  // Match `if (window.confirm('Are you sure you want to delete this ...?')) { deleteMutation.mutate(varName.id); }`
  const confirmRegex = /if\s*\(window\.confirm\([^)]+\)\)\s*\{\s*deleteMutation\.mutate\(([^.]+)\.id\);\s*\}/g;
  content = content.replace(confirmRegex, (match, varName) => {
    return `setItemToDelete(${varName});`;
  });

  // 4. Update deleteMutation
  if (!content.includes('setItemToDelete(null)')) {
    content = content.replace(
      /onSuccess:\s*\(\)\s*=>\s*queryClient\.invalidateQueries\(\{\s*queryKey:\s*\['[^']+'\]\s*\}\)/,
      `onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: ['${file.replace('.tsx', '').toLowerCase()}'] });\n      setItemToDelete(null);\n    }`
    );
    // Also we need to make sure we catch different onSuccess formats if they exist, but they are mostly single line in master pages.
  }

  // 5. Append Modal before the last </div>
  if (!content.includes('<DeleteConfirmationModal')) {
    const modalJSX = `
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        itemName={itemToDelete?.name}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
export default`;

    content = content.replace(/\s*<\/div>\s*\);\s*};\s*export default/g, modalJSX);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
