import type { Category } from 'src/types/catalog';
import { catalogFileFormat, catalogFileVersion, type CatalogFile } from 'src/schemes/catalog-file';

export function catalogFileName(date = new Date()) {
  return `command-catalog-${date.toISOString().slice(0, 10)}.json`;
}

export function serializeCatalog(categories: Category[], exportedAt = new Date()): string {
  const file: CatalogFile = {
    format: catalogFileFormat,
    version: catalogFileVersion,
    exportedAt: exportedAt.toISOString(),
    // Rebuilt field by field so record-only data (order, timestamps) never leaks into the file.
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      commands: category.commands.map((command) => ({
        id: command.id,
        name: command.name,
        description: command.description,
        template: command.template,
        options: command.options,
      })),
    })),
  };
  return `${JSON.stringify(file, null, 2)}\n`;
}
