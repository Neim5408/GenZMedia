/**
 * Compresses an image file on the client-side using Canvas.
 * Maintains quality and high resolution while shrinking file size.
 *
 * @param {File} file - The original image file.
 * @param {number} quality - JPEG compression quality (0.0 to 1.0).
 * @param {number} maxWidth - Maximum width boundary.
 * @param {number} maxHeight - Maximum height boundary.
 * @returns {Promise<File>} - Resolves to the compressed File object.
 */
export const compressImage = (file, quality = 0.75, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    // Only compress images
    if (!file || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new boundaries preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original if blob creation fails
              return;
            }
            // Create a compressed File object maintaining original filename
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            console.log(
              `Compressed image ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
