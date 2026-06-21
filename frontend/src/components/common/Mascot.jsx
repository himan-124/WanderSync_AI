export function Mascot({ size = 64, pose = "walk", style }) {
  // Placeholder Mascot for now, can be an actual SVG or Image
  return (
    <div 
      className="flex items-center justify-center bg-primary-100 text-primary-600 rounded-full font-bold"
      style={{ width: size, height: size, ...style }}
    >
      {pose === "cheer" ? "🙌" : pose === "point" ? "👉" : "🚶‍♂️"}
    </div>
  );
}
