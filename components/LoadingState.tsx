export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading content...</p>
      </div>
    </div>
  );
}
