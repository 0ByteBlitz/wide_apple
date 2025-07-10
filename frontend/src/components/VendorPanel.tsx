const VendorPanel = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Vendor Panel</h2>
            <div className="mb-6 text-lg text-gray-700 text-center">Vendor info and actions will appear here.</div>
            <button className="px-8 py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white hover:scale-105 transition-transform">Refresh</button>
        </div>
    </div>
)

export default VendorPanel
