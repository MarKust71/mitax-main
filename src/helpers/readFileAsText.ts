export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('File reading error'));
      }
    };

    reader.onerror = function () {
      reject(new Error('File reading error'));
    };

    reader.readAsText(file);
  });
}
