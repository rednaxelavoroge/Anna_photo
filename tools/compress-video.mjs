#!/usr/bin/env node
/**
 * Compress a short clip for the photography site (no YouTube).
 * Needs ffmpeg on PATH.
 *
 *   node tools/compress-video.mjs incoming.mov public/photos/video/clip-01.mp4
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error("Usage: node tools/compress-video.mjs <input> <output.mp4>");
  process.exit(1);
}

const dest = path.resolve(output);
fs.mkdirSync(path.dirname(dest), { recursive: true });

const args = [
  "-y",
  "-i",
  path.resolve(input),
  "-vf",
  "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,format=yuv420p",
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "23",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-movflags",
  "+faststart",
  dest,
];

const child = spawn("ffmpeg", args, { stdio: "inherit" });
child.on("error", () => {
  console.error("ffmpeg not found. Install ffmpeg, then run this again.");
  process.exit(1);
});
child.on("close", (code) => process.exit(code ?? 1));
