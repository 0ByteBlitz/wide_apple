import CardContainer from './CardContainer';

const FruitList = () => (
    <CardContainer
        heading="Fruit List"
        button={<button className="px-8 py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:scale-105 transition-transform">Refresh</button>}
    >
        <div className="mb-6 text-lg text-gray-700 text-center">Fruit data will appear here.</div>
    </CardContainer>
)

export default FruitList
