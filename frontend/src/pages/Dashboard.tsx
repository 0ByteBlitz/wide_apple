import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithAuth } from '../utils/tokenUtils'

const PLACEHOLDER_IMG = 'https://via.placeholder.com/80x80?text=Fruit';

const ALIEN_EXCHANGE_RATE = 3.14; // Mock: 1 unit = 3.14 alien currency
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

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
    const intervalRef = useRef<any>(null)
    // Add validation state
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchWithAuth('http://localhost:8000/vendors/me')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setVendor(data)
                setInventory(data.inventory || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [token, navigate, location, addSuccess])

    useEffect(() => {
        fetchWithAuth('http://localhost:8000/fruits')
            .then(res => res.ok ? res.json() : [])
            .then(data => setAllFruits(data))
            .catch(() => setAllFruits([]))
    }, [])

    // Fetch popular vendors for sidebar
    useEffect(() => {
        fetchWithAuth('http://localhost:8000/vendors/popular?limit=5')
            .then(res => res.ok ? res.json() : [])
            .then(data => setVendors(data))
            .catch(() => setVendors([]));
    }, []);

    // Live price polling
    useEffect(() => {
        let isMounted = true
        const fetchPrices = async () => {
            const priceMap: { [fruitId: number]: number | null } = {}
            await Promise.all(
                inventory.map(async (item) => {
                    try {
                        const res = await fetchWithAuth(`http://localhost:8000/prices?fruit_id=${item.fruit_id}&limit=1`)
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

    const validateAddForm = () => {
        const errors: any = {};
        if (!addForm.name.trim()) errors.name = 'Fruit name is required.';
        else if (allFruits.some(f => f.name.toLowerCase() === addForm.name.trim().toLowerCase())) errors.name = 'Fruit name already exists.';
        if (!addForm.flavor_profile.trim()) errors.flavor_profile = 'Flavor profile is required.';
        if (!addForm.dimension_origin.trim()) errors.dimension_origin = 'Dimension origin is required.';
        if (!addForm.rarity_level || isNaN(Number(addForm.rarity_level)) || Number(addForm.rarity_level) < 1 || Number(addForm.rarity_level) > 5 || !Number.isInteger(Number(addForm.rarity_level))) errors.rarity_level = 'Rarity level must be an integer between 1 and 5.';
        if (!addForm.base_value || isNaN(Number(addForm.base_value)) || Number(addForm.base_value) <= 0) errors.base_value = 'Base value must be a positive number.';
        if (!addForm.quantity || isNaN(Number(addForm.quantity)) || Number(addForm.quantity) <= 0 || !Number.isInteger(Number(addForm.quantity))) errors.quantity = 'Quantity must be a positive integer.';
        if (addForm.photo) {
            if (!addForm.photo.type.startsWith('image/')) errors.photo = 'File must be an image.';
            if (addForm.photo.size > 2 * 1024 * 1024) errors.photo = 'Image must be less than 2MB.';
        }
        return errors;
    };

    const handleAddFruit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        setAddSuccess('');
        const errors = validateAddForm();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
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
                const res = await fetchWithAuth('http://localhost:8000/fruits', {
                    method: 'POST',
                    body: formData
                })
                if (!res.ok) throw new Error('Failed to create fruit')
                const data = await res.json()
                fruit_id = data.id
            }
            // Add to inventory
            const res2 = await fetchWithAuth('http://localhost:8000/vendors/me/add-fruit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fruit_id, quantity: addForm.quantity }),
            })
            if (!res2.ok) throw new Error('Failed to add fruit')
            setAddSuccess('Fruit added to inventory!')
            setShowAddModal(false)
            setAddForm({
                name: '', flavor_profile: '', dimension_origin: '', rarity_level: '1', base_value: '1', quantity: '1', photo: null, photoPreview: ''
            })
        } catch {
            setAddError('Failed to add fruit. Please try again.')
        }
    }

    // Calculate inventory value in alien currency
    const inventoryWithValue = inventory.map(item => {
        const price = prices[item.fruit_id] || 0;
        return {
            ...item,
            value: price * item.quantity,
            alienValue: price * item.quantity * ALIEN_EXCHANGE_RATE,
        };
    });
    const totalAlienValue = inventoryWithValue.reduce((sum, item) => sum + item.alienValue, 0);

    // Data for chart
    const chartData = inventoryWithValue.map(item => ({
        name: item.fruit_name,
        value: item.alienValue,
    }));

    return (
        <div className="min-h-[80vh] w-full flex flex-col md:flex-row bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100 py-10">
            {/* Sidebar for popular vendors */}
            <aside className="hidden md:block w-64 mr-8 bg-white/80 rounded-3xl shadow-xl p-6 h-fit">
                <h3 className="text-xl font-bold mb-4 text-purple-700">Top 5 Popular Vendors</h3>
                <ul className="space-y-3">
                    {vendors.map(v => (
                        <li key={v.id} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-pink-400 inline-block" />
                            {v.name} <span className="text-xs text-gray-400">({v.species})</span>
                        </li>
                    ))}
                </ul>
            </aside>
            <div className="flex-1 flex flex-col gap-8">
                {/* Inventory Card */}
                <div className="p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center transition-transform hover:scale-[1.02]">
                    <h2 className="text-4xl font-extrabold mb-4 text-pink-600 text-center drop-shadow">Trader Dashboard</h2>
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
                    <div className="w-full flex flex-col md:flex-row gap-8">
                        {/* Inventory List */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="text-gray-500">Loading inventory...</div>
                            ) : inventoryWithValue.length === 0 ? (
                                <div className="text-gray-500">No items in inventory.</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
                                    {inventoryWithValue.map((item, idx) => (
                                        <div key={item.fruit_id} className="flex flex-col items-center bg-white rounded-xl shadow-lg p-4 transition-transform hover:scale-105">
                                            <img
                                                src={item.fruit?.photo_url || item.photo_url || PLACEHOLDER_IMG}
                                                alt={item.fruit_name}
                                                className="w-20 h-20 mb-2 rounded-full border-2 border-yellow-300 shadow"
                                            />
                                            <div className="font-bold text-lg text-gray-800 mb-1">{item.fruit_name}</div>
                                            <div className="text-sm text-gray-600 mb-2">Qty: {item.quantity}</div>
                                            <div className="text-sm text-blue-700 mb-2">Value: <span className="font-semibold">{item.alienValue.toFixed(2)} ⍦</span></div>
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
                        </div>
                        {/* Chart and Summary */}
                        <div className="w-full md:w-80 flex flex-col items-center">
                            <div className="mb-4 w-full text-center">
                                <div className="text-lg font-bold text-gray-700">Total Inventory Value</div>
                                <div className="text-2xl font-extrabold text-green-700">{totalAlienValue.toFixed(2)} ⍦</div>
                            </div>
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
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
                                    {fieldErrors.name && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.name}</div>}
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="flavor_profile"
                                        placeholder="Flavor Profile (comma separated)"
                                        value={addForm.flavor_profile}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    {fieldErrors.flavor_profile && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.flavor_profile}</div>}
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="dimension_origin"
                                        placeholder="Dimension Origin"
                                        value={addForm.dimension_origin}
                                        onChange={handleAddFormChange}
                                        required
                                    />
                                    {fieldErrors.dimension_origin && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.dimension_origin}</div>}
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
                                    {fieldErrors.rarity_level && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.rarity_level}</div>}
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
                                    {fieldErrors.base_value && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.base_value}</div>}
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
                                    {fieldErrors.quantity && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.quantity}</div>}
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleAddFormChange}
                                    />
                                    {fieldErrors.photo && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.photo}</div>}
                                    {addForm.photoPreview && (
                                        <img src={addForm.photoPreview} alt="Preview" className="w-24 h-24 rounded-full border-2 border-pink-400 shadow mb-2" />
                                    )}
                                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transition-transform" type="submit">Add</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
