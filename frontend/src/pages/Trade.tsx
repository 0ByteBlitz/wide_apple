import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../utils/tokenUtils'
import { BACKEND_URL } from '../constants';


const Trade = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('access_token')
    const [inventory, setInventory] = useState<any[]>([])
    const [vendor, setVendor] = useState<any>(null)
    const [selectedFruit, setSelectedFruit] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [toVendorId, setToVendorId] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [tradeType, setTradeType] = useState('send');
    const [currencyAmount, setCurrencyAmount] = useState<number | null>(null);
    const [alienCurrency, setAlienCurrency] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchWithAuth(`${BACKEND_URL}/vendors/me`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setVendor(data)
                setInventory(data.inventory || [])
            })
            .catch(() => setError('Failed to load vendor info'))
    }, [token, navigate])

    const validateFields = () => {
        const errors: any = {};
        if (selectedFruit === null) errors.selectedFruit = 'Select a fruit.';
        if (!quantity || quantity < 1) errors.quantity = 'Enter a valid quantity.';
        if (!toVendorId || Number(toVendorId) < 1) errors.toVendorId = 'Enter a valid target vendor ID.';
        if ((tradeType === 'buy' || tradeType === 'sell') && currencyAmount !== null && currencyAmount < 0) errors.currencyAmount = 'Currency amount must be positive.';
        return errors;
    };

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')
        setFieldErrors({})
        const errors = validateFields();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/trade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from_vendor_id: vendor.id,
                    to_vendor_id: Number(toVendorId),
                    fruit_id: selectedFruit,
                    quantity: Number(quantity),
                    trade_type: tradeType,
                    currency_amount: currencyAmount,
                    alien_currency: alienCurrency
                }),
            })
            if (!res.ok) throw new Error('Trade failed')
            const data = await res.json()
            setMessage(
                `Trade successful! Type: ${data.trade_type}, Fruit: ${data.details.fruit}, Quantity: ${data.details.quantity}, ` +
                (data.currency_amount ? `Currency Amount: ${data.currency_amount.toFixed(2)} ${data.alien_currency ? 'Ξ' : '$'}, ` : '') +
                `Tax: ${data.details.tax.toFixed(2)} ${data.alien_currency ? 'Ξ' : '$'}, Total Cost: ${data.details.total_cost.toFixed(2)} ${data.alien_currency ? 'Ξ' : '$'}`
            )
        } catch {
            setError('Trade failed. Please check your input and try again.')
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-xl p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center">
                <h2 className="text-4xl font-extrabold mb-4 text-gray-900 text-center">Trade Fruits</h2>
                {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}
                {message && <div className="text-green-600 mb-4 font-semibold">{message}</div>}
                <form onSubmit={handleTrade} className="w-full flex flex-col items-center gap-4">
                    <div className="w-full mb-2">
                        <label className="block font-bold mb-1">Trade Type
                            <span className="ml-1 text-xs text-gray-400" title="Choose the type of trade: send/request fruit, or buy/sell for currency.">?</span>
                        </label>
                        <select className="w-full p-2 border-2 border-gray-200 rounded-xl" value={tradeType} onChange={e => setTradeType(e.target.value)}>
                            <option value="send">Send Fruit</option>
                            <option value="request">Request Fruit</option>
                            <option value="buy">Buy Fruit (with Alien Currency)</option>
                            <option value="sell">Sell Fruit (for Alien Currency)</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <label className="block font-bold mb-1">Select Fruit</label>
                        <div className="grid grid-cols-4 gap-2">
                            {inventory.map((item: any) => (
                                <button
                                    type="button"
                                    key={item.fruit_id}
                                    className={`flex flex-col items-center p-2 rounded-xl border-2 ${selectedFruit === item.fruit_id ? 'border-pink-500' : 'border-gray-200'} bg-white shadow hover:scale-105 transition-transform`}
                                    onClick={() => setSelectedFruit(item.fruit_id)}
                                >
                                    <img
                                        src={''} // Placeholder, or use a real image URL if available
                                        alt={item.fruit_name}
                                        className="w-12 h-12 mb-1 rounded-full border border-yellow-300"
                                    />
                                    <span className="text-xs font-bold text-gray-700">{item.fruit_name}</span>
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                </button>
                            ))}
                        </div>
                        {fieldErrors.selectedFruit && <div className="text-red-500 text-xs mt-1">{fieldErrors.selectedFruit}</div>}
                    </div>
                    <div className="w-full flex gap-2">
                        <div className="flex-1">
                            <input
                                className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
                                type="number"
                                min={1}
                                max={selectedFruit !== null ? (inventory.find((i: any) => i.fruit_id === selectedFruit)?.quantity || 1) : 1}
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                                placeholder="Quantity"
                                required
                            />
                            {fieldErrors.quantity && <div className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</div>}
                        </div>
                        <div className="flex-1">
                            <input
                                className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                                type="number"
                                min={1}
                                value={toVendorId}
                                onChange={e => setToVendorId(e.target.value)}
                                placeholder="Target Vendor ID"
                                required
                            />
                            {fieldErrors.toVendorId && <div className="text-red-500 text-xs mt-1">{fieldErrors.toVendorId}</div>}
                        </div>
                    </div>
                    {(tradeType === 'buy' || tradeType === 'sell') && (
                        <div className="w-full mb-2">
                            <label className="block font-bold mb-1">Currency Amount (leave blank to auto-calculate)
                                <span className="ml-1 text-xs text-gray-400" title="If left blank, the backend will calculate the amount.">?</span>
                            </label>
                            <input
                                className="w-full p-2 border-2 border-gray-200 rounded-xl"
                                type="number"
                                value={currencyAmount ?? ''}
                                onChange={e => setCurrencyAmount(e.target.value ? Number(e.target.value) : null)}
                                placeholder="Currency Amount (optional)"
                            />
                            {fieldErrors.currencyAmount && <div className="text-red-500 text-xs mt-1">{fieldErrors.currencyAmount}</div>}
                        </div>
                    )}
                    <div className="w-full flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={alienCurrency}
                            onChange={e => setAlienCurrency(e.target.checked)}
                            id="alien-currency"
                        />
                        <label htmlFor="alien-currency" className="ml-2">Use Alien Currency</label>
                    </div>
                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-105 transition-transform mt-2 disabled:opacity-60" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Trade'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Trade 