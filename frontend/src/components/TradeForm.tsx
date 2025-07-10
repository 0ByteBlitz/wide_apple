const TradeForm = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <form className="w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Trade Fruits</h2>
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="From Vendor ID" />
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="To Vendor ID" />
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="Fruit ID" />
            <input className="w-full mb-6 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="Quantity" />
            <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-105 transition-transform mb-2" type="submit">Submit Trade</button>
        </form>
    </div>
)

export default TradeForm
