import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithAuth } from '../utils/tokenUtils'
import { useRef as useReactRef, useEffect as useReactEffect } from 'react';
import { BACKEND_URL } from '../constants';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/80x80?text=Fruit';

const ALIEN_EXCHANGE_RATE = 3.14; // Mock: 1 unit = 3.14 alien currency
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const getFruitImageUrl = (item: any) => {
    const url = item.fruit?.photo_url || item.photo_url;
    if (url && url.startsWith('/static/')) {
        return `${BACKEND_URL}${url}`;
    }
    return url || PLACEHOLDER_IMG;
};

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
    const [addLoading, setAddLoading] = useState(false);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);
    const modalRef = useReactRef<HTMLDivElement>(null);
    // Focus trap for accessibility
    useReactEffect(() => {
        if (showAddModal && modalRef.current) {
            modalRef.current.focus();
        }
    }, [showAddModal]);
    // Auto-close modal after success
    useReactEffect(() => {
        if (showSuccessAnim) {
            const timer = setTimeout(() => {
                setShowAddModal(false);
                setShowSuccessAnim(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showSuccessAnim]);
    // Animate modal open/close (simple scale/fade)
    const modalAnimClass = showAddModal ? 'animate-fade-in-scale' : 'animate-fade-out-scale';
    // Drag-and-drop image upload
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleAddFormChange({ target: { name: 'photo', files: [file] } });
        }
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchWithAuth(`${BACKEND_URL}/vendors/me`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setVendor(data)
                setInventory(data.inventory_items || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [token, navigate, location, addSuccess])

    useEffect(() => {
        fetchWithAuth(`${BACKEND_URL}/fruits`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setAllFruits(data))
            .catch(() => setAllFruits([]))
    }, [])

    // Fetch popular vendors for sidebar
    useEffect(() => {
        fetchWithAuth(`${BACKEND_URL}/vendors/popular?limit=5`)
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
                        const res = await fetchWithAuth(`${BACKEND_URL}/prices?fruit_id=${item.fruit_id}&limit=1`)
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
        if (!addForm.photo) {
            errors.photo = 'Image is required.';
        } else {
            if (!addForm.photo.type.startsWith('image/')) errors.photo = 'File must be an image.';
            if (addForm.photo.size > 2 * 1024 * 1024) errors.photo = 'Image must be less than 2MB.';
        }
        return errors;
    };

    const handleAddFruit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        setAddSuccess('');
        setAddLoading(true);
        const errors = validateAddForm();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) { setAddLoading(false); return; }
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
                const res = await fetchWithAuth(`${BACKEND_URL}/fruits`, {
                    method: 'POST',
                    body: formData
                })
                if (!res.ok) throw new Error('Failed to create fruit')
                const data = await res.json()
                fruit_id = data.id
            }
            // Add to inventory
            const res2 = await fetchWithAuth(`${BACKEND_URL}/vendors/me/add-fruit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fruit_id, quantity: addForm.quantity }),
            })
            if (!res2.ok) throw new Error('Failed to add fruit')
            setAddSuccess('Fruit added to inventory!')
            setShowSuccessAnim(true);
            setAddForm({
                name: '', flavor_profile: '', dimension_origin: '', rarity_level: '1', base_value: '1', quantity: '1', photo: null, photoPreview: ''
            })
        } catch {
            setAddError('Failed to add fruit. Please try again.')
        } finally {
            setAddLoading(false);
        }
    }

    // Calculate inventory value in alien currency
    const inventoryWithValue = inventory.map(item => {
        const price = prices[item.fruit_id] ?? item.fruit?.base_value ?? 0;
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
        <div className="min-h-[80vh] w-full flex flex-col md:flex-row overflow-x-hidden bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100 py-10 px-4">
            <div className="flex-1 flex flex-col gap-10">
                {/* Inventory Card */}
                <div className="py-12 px-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center max-w-4xl mx-auto w-full">
                    <h2 className="text-4xl font-extrabold mb-4 text-pink-600 text-center drop-shadow">Trader Dashboard</h2>
                    {vendor && (
                        <div className="mt-6 mb-8 w-full flex justify-center">
                            <div className="relative flex flex-row items-center w-full max-w-2xl min-h-[110px] p-4 rounded-2xl bg-gradient-to-br from-purple-900 via-blue-800 to-green-700 border-4 border-green-400/60 shadow-2xl text-white alien-card-glow">
                                {/* Alien avatar/icon */}
                                <div className="flex-shrink-0 mr-6 flex items-center justify-center">
                                    <span className="inline-block w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 via-blue-400 to-purple-500 border-4 border-white shadow-lg flex items-center justify-center text-5xl">
                                        🛸
                                    </span>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-2xl font-extrabold tracking-widest mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>{vendor.name}</div>
                                    <div className="text-lg font-semibold text-green-200 mb-1 flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 rounded-full bg-green-400 animate-pulse"></span>
                                        {vendor.species}
                                    </div>
                                    <div className="text-md text-blue-200 italic">{vendor.home_dimension}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex w-full justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-center text-purple-600">Your Inventory</h3>
                        <button
                            className="px-4 py-2 rounded-full font-bold text-sm shadow bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:scale-105 transition-transform"
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
                                    {inventoryWithValue.map(item => (
                                        <div key={item.fruit_id} className="flex flex-col items-center bg-white rounded-xl shadow-lg p-4 transition-transform hover:scale-102">
                                            <img
                                                src={getFruitImageUrl(item)}
                                                alt={item.fruit?.name || item.fruit_name}
                                                className="w-20 h-20 mb-2 rounded-full border-2 border-yellow-300 shadow"
                                            />
                                            <div className="font-bold text-lg text-gray-800 mb-1">{item.fruit?.name || item.fruit_name}</div>
                                            <div className="text-sm text-gray-600 mb-2">Qty: {item.quantity}</div>
                                            <div className="text-sm text-blue-700 mb-2">Value: <span className="font-semibold">{item.alienValue.toFixed(2)} ⍦</span></div>
                                            <button
                                                className="px-4 py-2 rounded-full font-bold text-sm shadow bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white hover:scale-105 transition-transform"
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
                                            {chartData.map((_, index) => (
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
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" aria-modal="true" role="dialog" tabIndex={-1}>
                            <div
                                ref={modalRef}
                                className={`bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm relative outline-none ${modalAnimClass}`}
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Escape') setShowAddModal(false); }}
                                aria-label="Add Fruit Modal"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                <button className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-pink-500" onClick={() => setShowAddModal(false)} aria-label="Close Modal">&times;</button>
                                <h3 className="text-xl font-bold mb-4 text-pink-600">Add Fruit to Inventory</h3>
                                {addError && <div className="text-red-500 mb-2 font-semibold">{addError}</div>}
                                {addSuccess && showSuccessAnim && (
                                    <div className="flex flex-col items-center mb-2">
                                        <svg className="w-12 h-12 text-green-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <div className="text-green-600 font-bold mt-2">{addSuccess}</div>
                                    </div>
                                )}
                                <form onSubmit={handleAddFruit} className="w-full flex flex-col items-center gap-4">
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="text"
                                        name="name"
                                        placeholder="Fruit Name"
                                        value={addForm.name}
                                        onChange={handleAddFormChange}
                                        required
                                        aria-label="Fruit Name"
                                        title="Enter a unique name for your fruit."
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
                                        aria-label="Flavor Profile"
                                        title="Describe the flavor profile, e.g. sweet, tart."
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
                                        aria-label="Dimension Origin"
                                        title="Enter the origin dimension for this fruit."
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
                                        aria-label="Rarity Level"
                                        title="Rarity level from 1 (common) to 5 (legendary)."
                                    />
                                    {fieldErrors.rarity_level && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.rarity_level}</div>}
                                    <input
                                        className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                        type="number"
                                        name="base_value"
                                        min={1}
                                        step="any"
                                        placeholder="Base Value"
                                        value={addForm.base_value}
                                        onChange={handleAddFormChange}
                                        required
                                        aria-label="Base Value"
                                        title="Base value in standard currency."
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
                                        aria-label="Quantity"
                                        title="How many of this fruit to add to your inventory."
                                    />
                                    {fieldErrors.quantity && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.quantity}</div>}
                                    <div className="w-full flex flex-col items-center border-2 border-dashed border-pink-300 rounded-xl p-2 bg-pink-50 hover:bg-pink-100 transition-colors" onDrop={handleDrop} onDragOver={handleDragOver} tabIndex={0} aria-label="Photo Upload Area">
                                        <input
                                            className="w-full p-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                                            type="file"
                                            name="photo"
                                            accept="image/*"
                                            onChange={handleAddFormChange}
                                            aria-label="Photo Upload"
                                            title="Upload a photo (max 2MB, image only). Drag and drop supported."
                                            required
                                        />
                                        <span className="text-xs text-gray-500 mt-1">Drag and drop an image or click to select. Max 2MB.</span>
                                        {fieldErrors.photo && <div className="text-red-500 text-sm mb-1 w-full">{fieldErrors.photo}</div>}
                                        {addForm.photoPreview && (
                                            <img src={addForm.photoPreview} alt="Preview" className="w-24 h-24 rounded-full border-2 border-pink-400 shadow mb-2" />
                                        )}
                                    </div>
                                    <button className="w-full py-3 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transition-transform disabled:opacity-60" type="submit" disabled={addLoading || showSuccessAnim} aria-disabled={addLoading || showSuccessAnim}>
                                        {addLoading ? 'Adding...' : 'Add'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Sidebar for popular vendors (moved to right) */}
            <aside className="hidden md:block w-80 ml-8 bg-white/80 rounded-3xl shadow-xl p-6 h-fit">
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
        </div>
    )
}

export default Dashboard
