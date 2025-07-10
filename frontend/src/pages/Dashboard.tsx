import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const fruitImages = [
    'fruit_0_0.png', 'fruit_0_1.png', 'fruit_0_2.png', 'fruit_0_3.png',
    'fruit_1_0.png', 'fruit_1_1.png', 'fruit_1_2.png', 'fruit_1_3.png',
    'fruit_2_0.png', 'fruit_2_1.png', 'fruit_2_2.png', 'fruit_2_3.png',
    'fruit_3_0.png', 'fruit_3_1.png', 'fruit_3_2.png', 'fruit_3_3.png',
]

const getFruitImage = (fruitId: number) => require(`../assets/alien_fruit_heads/${fruitImages[fruitId % fruitImages.length]}`)

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('access_token')
    const [inventory, setInventory] = useState<any[]>([])
    const [vendor, setVendor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [prices, setPrices] = useState<{ [fruitId: number]: number | null }>({})
    const [showAddModal, setShowAddModal] = useState(false)
    const [allFruits, setAllFruits] = useState<any[]>([])
    const [addError, setAddError] = useState('')
    const [addSuccess, setAddSuccess] = useState('')
    const [addForm, setAddForm] = useState({
        name: '',
        flavor_profile: '',
        dimension_origin: '',
        rarity_level: '',
        base_value: '',
        quantity: '',
        photo: null as File | null,
        photoPreview: ''
    })
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [token, navigate, location, addSuccess])

    useEffect(() => {
        fetch('http://localhost:8000/fruits')
            .then(res => res.ok ? res.json() : [])
            .then(data => setAllFruits(data))
            .catch(() => setAllFruits([]))
    }, [])

    // Live price polling
    useEffect(() => {
        let isMounted = true
        const fetchPrices = async () => {
            const priceMap: { [fruitId: number]: number | null } = {}
            await Promise.all(
                inventory.map(async (item) => {
                    try {
                        const res = await fetch(`http://localhost:8000/prices?fruit_id=${item.fruit_id}&limit=1`)
                        const data = await res.json()
                        priceMap[item.fruit_id] = data.prices?.[0]?.price ?? null
                    } catch {
                        priceMap[item.fruit_id] = null
                    }
                })
            )
            if (isMounted) setPrices(priceMap)
        }
        if (inventory.length > 0) {
            fetchPrices()
            intervalRef.current = setInterval(fetchPrices, 5000)
        }
        return () => {
            isMounted = false
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [inventory])

    const handleAddFormChange = (e: any) => {
        const { name, value, files } = e.target
        if (name === 'photo' && files && files[0]) {
            setAddForm(f => ({ ...f, photo: files[0], photoPreview: URL.createObjectURL(files[0]) }))
        } else {
            setAddForm(f => ({ ...f, [name]: value }))
        }
    }

    const handleAddFruit = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddError('')
        setAddSuccess('')
        // Check if fruit exists
        const existing = allFruits.find(f => f.name.toLowerCase() === addForm.name.trim().toLowerCase())
        let fruit_id = existing ? existing.id : null
        try {
            if (!fruit_id) {
                // Create new fruit
                const formData = new FormData()
                formData.append('name', addForm.name)
                formData.append('flavor_profile', addForm.flavor_profile)
                formData.append('dimension_origin', addForm.dimension_origin)
                formData.append('rarity_level', String(addForm.rarity_level))
                formData.append('base_value', String(addForm.base_value))
                if (addForm.photo) formData.append('photo', addForm.photo)
                const res = await fetch('http://localhost:8000/fruits', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                })
                if (!res.ok) throw new Error('Failed to create fruit')
                const data = await res.json()
                fruit_id = data.id
            }
            // Add to inventory
            const res2 = await fetch('http://localhost:8000/vendors/me/add-fruit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ fruit_id, quantity: addForm.quantity }),
            })
            if (!res2.ok) throw new Error('Failed to add fruit')
            setAddSuccess('Fruit added to inventory!')
            setShowAddModal(false)
            setAddForm({
                name: '', flavor_profile: '', dimension_origin: '', rarity_level: 1, base_value: 1, quantity: 1, photo: null, photoPreview: ''
            })
        } catch {
            setAddError('Failed to add fruit. Please try again.')
        }
    }

    return (
        <div className="min-h-[80vh] w-full flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100 py-10">
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
                {/* Inventory Card */}
                <div className="flex-1 p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center transition-transform hover:scale-[1.02]">
                    <h2 className="text-4xl font-extrabold mb-4 text-pink-600 text-center drop-shadow">Dashboard</h2>
                    {vendor && (
                        <div className="mb-8 w-full text-center">
                            <div className="text-lg font-bold text-green-700">Vendor Profile</div>
                            <div className="text-md text-gray-700">Name: <span className="font-semibold text-yellow-600">{vendor.name}</span></div>
                            <div className="text-md text-gray-700">Species: <span className="font-semibold text-blue-600">{vendor.species}</span></div>
                            <div className="text-md text-gray-700">Home Dimension: <span className="font-semibold text-pink-600">{vendor.home_dimension}</span></div>
                        </div>
                    )}
                    <div className="flex w-full justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-center text-purple-600">Your Inventory</h3>
                        <button
                            className="px-4 py-2 rounded-full font-bold text-sm shadow bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:scale-110 transition-transform"
                            onClick={() => { setShowAddModal(true); setAddError(''); setAddSuccess(''); }}
                        >
                            + Add Fruit
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-gray-500">Loading inventory...</div>
                    ) : inventory.length === 0 ? (
                        <div className="text-gray-500">No items in inventory.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
                            {inventory.map((item) => (
                                <div key={item.fruit_id} className="flex flex-col items-center bg-white rounded-xl shadow-lg p-4 transition-transform hover:scale-105">
                                    <img
                                        src={getFruitImage(item.fruit_id)}
                                        alt={item.fruit_name}
                                        className="w-20 h-20 mb-2 rounded-full border-2 border-yellow-300 shadow"
                                    />
                                    <div className="font-bold text-lg text-gray-800 mb-1">{item.fruit_name}</div>
                                    <div className="text-sm text-gray-600 mb-2">Qty: {item.quantity}</div>
                                    <button
                                        className="px-4 py-2 rounded-full font-bold text-sm shadow bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-110 transition-transform"
                                        onClick={() => navigate('/trade', { state: { fruitId: item.fruit_id } })}
                                    >
                                        Trade
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Add Fruit Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm relative">
                                <button className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-pink-500" onClick={() => setShowAddModal(false)}>&times;</button>
                                <h3 className="text-xl font-bold mb-4 text-pink-600">Add Fruit to Inventory</h3>
                                {addError && <div className="text-red-500 mb-2 font-semibold">{addError}</div>}
                                {addSuccess && <div className="text-green-600 mb-2 font-semibold">{addSuccess}</div>}
                                <form onSubmit={handleAddFruit} className="w-full flex flex-col items-center gap-4">
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="name"
                                        placeholder="Fruit Name"
                                        value={addForm.name}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="flavor_profile"
                                        placeholder="Flavor Profile (comma separated)"
                                        value={addForm.flavor_profile}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="dimension_origin"
                                        placeholder="Dimension Origin"
                                        value={addForm.dimension_origin}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="number"
                                        name="rarity_level"
                                        min={1}
                                        max={5}
                                        placeholder="Rarity Level (1-5)"
                                        value={addForm.rarity_level}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="number"
                                        name="base_value"
                                        min={1}
                                        placeholder="Base Value"
                                        value={addForm.base_value}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="number"
                                        name="quantity"
                                        min={1}
                                        placeholder="Quantity"
                                        value={addForm.quantity}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleAddFormChange}
                                    />
                                    {addForm.photoPreview && (
                                        <img src={addForm.photoPreview} alt="Preview" className="w-24 h-24 rounded-full border-2 border-pink-400 shadow mb-2" />
                                    )}
                                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transition-transform" type="submit">Add</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                {/* Prices Card */}
                <div className="flex-1 p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center transition-transform hover:scale-[1.02] min-w-[300px] max-w-md">
                    <h3 className="text-2xl font-bold mb-6 text-center text-green-600">Current Fruit Prices</h3>
                    {inventory.length === 0 ? (
                        <div className="text-gray-400">No fruits to show prices for.</div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            {inventory.map((item) => (
                                <div key={item.fruit_id} className="flex items-center gap-4 bg-white rounded-xl shadow p-3 transition-transform hover:scale-105">
                                    <img
                                        src={getFruitImage(item.fruit_id)}
                                        alt={item.fruit_name}
                                        className="w-12 h-12 rounded-full border border-yellow-300"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800">{item.fruit_name}</div>
                                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="text-lg font-bold text-blue-600 animate-pulse">
                                        {prices[item.fruit_id] !== undefined && prices[item.fruit_id] !== null ? `Ξ${prices[item.fruit_id]}` : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
