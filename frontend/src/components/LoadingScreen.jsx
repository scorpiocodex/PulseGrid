export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-300">
      <img
        src="/logo.png"
        alt="PulseGrid"
        className="w-16 h-16 mb-6 opacity-90"
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse w-3/4" />
      </div>
      <p className="mt-4 text-sm text-gray-400">Collecting data...</p>
    </div>
  )
}
