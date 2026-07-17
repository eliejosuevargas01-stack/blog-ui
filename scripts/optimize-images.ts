import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

async function optimizeImages() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error("Public directory not found");
    return;
  }

  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".png" || ext === ".jpg" || ext === ".jpeg";
  });

  console.log(`Found ${imageFiles.length} images to optimize in public/`);

  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);

    const webpPath = path.join(PUBLIC_DIR, `${baseName}.webp`);
    const avifPath = path.join(PUBLIC_DIR, `${baseName}.avif`);

    try {
      // Convert to WebP
      if (!fs.existsSync(webpPath)) {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`Converted ${file} to WebP`);
      } else {
        console.log(`${baseName}.webp already exists`);
      }

      // Convert to AVIF
      if (!fs.existsSync(avifPath)) {
        await sharp(inputPath)
          .avif({ quality: 65 })
          .toFile(avifPath);
        console.log(`Converted ${file} to AVIF`);
      } else {
        console.log(`${baseName}.avif already exists`);
      }
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
    }
  }
}

optimizeImages();
