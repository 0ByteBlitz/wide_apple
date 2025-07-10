import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const fruitImages = [
    'fruit_0_0.png', 'fruit_0_1.png', 'fruit_0_2.png', 'fruit_0_3.png',
    'fruit_1_0.png', 'fruit_1_1.png', 'fruit_1_2.png', 'fruit_1_3.png',
    'fruit_2_0.png', 'fruit_2_1.png', 'fruit_2_2.png', 'fruit_2_3.png',
    'fruit_3_0.png', 'fruit_3_1.png', 'fruit_3_2.png', 'fruit_3_3.png',
]

const Trade = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('access_token')
    const [inventory, setInventory] = useState([])
    const [vendor, setVendor] = useState<any>(null)
    const [selectedFruit, setSelectedFruit] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [toVendorId, setToVendorId] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetch('http://localhost:8000/vendors/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setVendor(data)
                setInventory(data.inventory || [])
            })
            .catch(() => setError('Failed to load vendor info'))
    }, [token, navigate])

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')
        if (selectedFruit === null || !quantity || !toVendorId) {
            setError('Please select a fruit, quantity, and target vendor ID.')
            return
        }
        try {
            const res = await fetch('http://localhost:8000/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    from_vendor_id: vendor.id,
                    to_vendor_id: Number(toVendorId),
                    fruit_id: selectedFruit,
                    quantity: Number(quantity),
                }),
            })
            if (!res.ok) throw new Error('Trade failed')
            setMessage('Trade successful!')
        } catch {
            setError('Trade failed. Please check your input and try again.')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-xl p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center">
                <h2 className="text-4xl font-extrabold mb-4 text-gray-900 text-center">Trade Fruits</h2>
                {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}
                {message && <div className="text-green-600 mb-4 font-semibold">{message}</div>}
                <form onSubmit={handleTrade} className="w-full flex flex-col items-center gap-4">
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
                                        src={require(`../assets/alien_fruit_heads/${fruitImages[item.fruit_id % fruitImages.length]}`)}
                                        alt={item.fruit_name}
                                        className="w-12 h-12 mb-1 rounded-full border border-yellow-300"
                                    />
                                    <span className="text-xs font-bold text-gray-700">{item.fruit_name}</span>
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full flex gap-2">
                        <input
                            className="w-1/2 p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
                            type="number"
                            min={1}
                            max={selectedFruit !== null ? (inventory.find((i: any) => i.fruit_id === selectedFruit)?.quantity || 1) : 1}
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            placeholder="Quantity"
                            required
                        />
                        <input
                            className="w-1/2 p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                            type="number"
                            min={1}
                            value={toVendorId}
                            onChange={e => setToVendorId(e.target.value)}
                            placeholder="Target Vendor ID"
                            required
                        />
                    </div>
                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-105 transition-transform mt-2" type="submit">Submit Trade</button>
                </form>
            </div>
        </div>
    )
}

export default Trade 