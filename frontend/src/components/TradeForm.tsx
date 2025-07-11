import CardContainer from './CardContainer';

const TradeForm = () => (
    <CardContainer
        heading="Trade Fruits"
        button={null}
    >
        <form className="w-full flex flex-col items-center">
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="From Vendor ID" />
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="To Vendor ID" />
            <input className="w-full mb-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="Fruit ID" />
            <input className="w-full mb-6 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" placeholder="Quantity" />
            <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-105 transition-transform mb-2" type="submit">Submit Trade</button>
        </form>
    </CardContainer>
)

export default TradeForm
