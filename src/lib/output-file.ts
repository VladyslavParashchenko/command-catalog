const compoundExtensions = ['.tar.gz', '.tar.bz2', '.tar.xz', '.tar.zst', '.tar.lz'];

export function outputFileName(value: string, suffix: string): string {
  if (!value) return '';

  const slashIndex = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
  const directory = value.slice(0, slashIndex + 1);
  const fileName = value.slice(slashIndex + 1);
  const lowerName = fileName.toLowerCase();
  const compoundExtension = compoundExtensions.find((extension) => lowerName.endsWith(extension));
  const extension = compoundExtension ?? fileExtension(fileName);
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;

  return `${directory}${stem}-${suffix}${extension}`;
}

function fileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) return '';
  return fileName.slice(dotIndex);
}
