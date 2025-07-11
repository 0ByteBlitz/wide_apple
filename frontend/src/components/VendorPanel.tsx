import CardContainer from './CardContainer';

const VendorPanel = () => (
    <CardContainer
        heading="Vendor Panel"
        button={<button className="px-8 py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white hover:scale-105 transition-transform">Refresh</button>}
    >
        <div className="mb-6 text-lg text-gray-700 text-center">Vendor info and actions will appear here.</div>
    </CardContainer>
)

export default VendorPanel
