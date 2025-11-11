const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");

// OG Image (1200x630)
function generateOGImage() {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#c40e2d");
  gradient.addColorStop(1, "#a00c26");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // PDF Icon background
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(100, 100, 350, 430);

  // PDF Icon
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 180px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 275, 315);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "left";
  ctx.fillText("iLovePDF", 500, 200);

  // Subtitle
  ctx.font = "42px Arial";
  ctx.fillText("Online PDF Tools", 500, 280);

  // Features
  ctx.font = "28px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const features = [
    "✓ Merge & Split PDFs",
    "✓ Compress & Convert",
    "✓ Edit & Sign",
    "✓ Free & Easy to Use",
  ];
  features.forEach((feature, i) => {
    ctx.fillText(feature, 500, 350 + i * 45);
  });

  return canvas;
}

// Twitter Card (1200x600)
function generateTwitterImage() {
  const canvas = createCanvas(1200, 600);
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
  gradient.addColorStop(0, "#c40e2d");
  gradient.addColorStop(1, "#a00c26");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 600);

  // PDF Icon
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.font = "bold 300px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 600, 300);

  // Title overlay
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Arial";
  ctx.fillText("iLovePDF", 600, 200);

  ctx.font = "40px Arial";
  ctx.fillText("Free Online PDF Tools", 600, 400);

  return canvas;
}

// Favicon (32x32)
function generateFavicon32() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(0, 0, 32, 32);

  // PDF text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 16, 16);

  return canvas;
}

// Favicon (16x16)
function generateFavicon16() {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(0, 0, 16, 16);

  // Simple PDF icon
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(4, 3, 8, 10);
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(5, 6, 6, 2);

  return canvas;
}

// Apple Touch Icon (180x180)
function generateAppleTouchIcon() {
  const canvas = createCanvas(180, 180);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(0, 0, 180, 180);

  // PDF Icon background
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(30, 30, 120, 120);

  // PDF text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 90, 90);

  return canvas;
}

// Android Chrome Icon (192x192)
function generateAndroid192() {
  const canvas = createCanvas(192, 192);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(0, 0, 192, 192);

  // PDF Icon background
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(40, 40, 112, 112);

  // PDF text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 96, 96);

  return canvas;
}

// Android Chrome Icon (512x512)
function generateAndroid512() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#c40e2d";
  ctx.fillRect(0, 0, 512, 512);

  // PDF Icon background
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(100, 100, 312, 312);

  // PDF text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 180px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PDF", 256, 256);

  // Subtitle
  ctx.font = "48px Arial";
  ctx.fillText("iLovePDF", 256, 380);

  return canvas;
}

// Generate all images
console.log("Generating images...");

const images = [
  { name: "og-image.png", generator: generateOGImage },
  { name: "twitter-image.png", generator: generateTwitterImage },
  { name: "favicon-32x32.png", generator: generateFavicon32 },
  { name: "favicon-16x16.png", generator: generateFavicon16 },
  { name: "apple-touch-icon.png", generator: generateAppleTouchIcon },
  { name: "android-chrome-192x192.png", generator: generateAndroid192 },
  { name: "android-chrome-512x512.png", generator: generateAndroid512 },
];

images.forEach(({ name, generator }) => {
  const canvas = generator();
  const buffer = canvas.toBuffer("image/png");
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Generated ${name}`);
});

console.log("\nAll images generated successfully!");
