import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './adminMenu.css';
import MenuManagement from '../contracts/MenuManagement.json';

const AdminMenu = ( {staffIndex} ) => {
    const [web3, setWeb3] = useState(null);
    const [menuInstance, setMenuInstance] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemAvailability, setNewItemAvailability] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editItemName, setEditItemName] = useState('');
    const [editItemPrice, setEditItemPrice] = useState('');
    const [editItemAvailability, setEditItemAvailability] = useState('');


    useEffect(() => {
        const initWeb3 = async () => {
            const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
            setWeb3(web3Instance);

            const networkId = await web3Instance.eth.net.getId();
            const menuNetwork = MenuManagement.networks[networkId];

            const menuContractInstance = new web3Instance.eth.Contract(
                MenuManagement.abi,
                menuNetwork && menuNetwork.address,
            );
            setMenuInstance(menuContractInstance);

            loadMenuItems(menuContractInstance);
        };

        initWeb3();
    }, []);

    // Updated loadMenuItems function
    const loadMenuItems = async (instance) => {
        const items = await instance.methods.getMenuItems().call();
        setMenuItems(items.map(item => ({
            id: item.itemId, // Ensure this is the correct property name for the item ID from your contract
            name: item.name,
            price: item.price.toString(),
            availability: item.availability.toString()
        })));
    };

    // const loadMenuItems = async (instance) => {
    //     const itemCount = await instance.methods.itemCount().call();
    // let items = [];
    // for (let i = 1; i <= itemCount; i++) {
    //     let item = await instance.methods.getItemDetails(i).call();

    //     if (item[0] !== undefined) { // Check if item id is defined
    //         items.push({
    //             id: Number(item[0]), // Convert BigInt to Number if needed
    //             name: item[1],
    //             price: item[2].toString(), // Convert BigInt to String if price is defined
    //             availability: Number(item[3]) // Convert BigInt to Number if availability is defined
    //         });
    //     }
    // }
    // setMenuItems(items);
    // };
    // Add a new menu item
    const addItem = async () => {
        const accounts = await web3.eth.getAccounts();
        try {
            const gasLimit = await menuInstance.methods.addItem(newItemName, newItemPrice, newItemAvailability).estimateGas({ from: accounts[staffIndex]});
            await menuInstance.methods.addItem(newItemName, newItemPrice, newItemAvailability).send({ from: accounts[staffIndex], gas: gasLimit });
            // Optimistically add the item to the UI
            setMenuItems([...menuItems, { 
                id: menuItems.length + 1, // Assuming ID is just a sequence
                name: newItemName, 
                price: newItemPrice, 
                availability: newItemAvailability 
            }]);
            window.alert("Item Added Succesfully :)")
            window.location.reload();
        } catch (error) {
            console.error("Error adding item:", error);
        }
        // Clear input fields
        setNewItemName('');
        setNewItemPrice('');
        setNewItemAvailability('');
    };

    // Update an existing menu item
    const updateItem = async (itemId, name, price, availability) => {
        const accounts = await web3.eth.getAccounts();
        try {
            const gasLimit = await menuInstance.methods.updateItem(itemId, name, price, availability).estimateGas({ from: accounts[staffIndex] });
            await menuInstance.methods.updateItem(itemId, name, price, availability).send({ from: accounts[staffIndex], gas: gasLimit });
 // Optimistically update the item in the UI
            setMenuItems(menuItems.map(item => 
                item.id === itemId ? { ...item, name, price, availability } : item
            ));
            window.alert("Item Updated Succesfully :)")
            window.location.reload();
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    // Remove a menu item
    const removeItem = async (itemId) => {
        const accounts = await web3.eth.getAccounts();
        console.log("Removing item with ID:", itemId); // Debug log
        console.log("Using account:", accounts[staffIndex]); // Debug log
        try {
            const gasLimit = await menuInstance.methods.removeItem(itemId).estimateGas({ from: accounts[staffIndex] });
            await menuInstance.methods.removeItem(itemId).send({ from: accounts[staffIndex], gas: gasLimit });
            // Optimistically remove the item from the UI
            setMenuItems(menuItems.filter(item => item.id !== itemId));
            window.alert("Item Removed Succesfully :|")
            window.location.reload();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const startEditing = (item) => {
        setEditingItemId(item.id);
        setEditItemName(item.name);
        setEditItemPrice(item.price);
        setEditItemAvailability(item.availability);
    };

    const stopEditingAndUpdate = async () => {
        await updateItem(editingItemId, editItemName, editItemPrice, editItemAvailability);
        setEditingItemId(null);
    };

    const stopEditing = () => {
        setEditingItemId(null);
    };
    


    // Render UI for admin operations
    return (
        <div className="admin-menu">
            <h1>Account: {staffIndex}</h1>
            <h1>Staff Menu Management</h1>
            <div className="admin-form">
                <h2>Add New Item</h2>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Item Price"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Availability"
                    value={newItemAvailability}
                    onChange={(e) => setNewItemAvailability(e.target.value)}
                />
                <button onClick={addItem}>Add Item</button>
            </div>
            <div className="menu-items">
                <h2>Menu Items</h2>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            {editingItemId === item.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editItemName}
                                        onChange={(e) => setEditItemName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editItemPrice}
                                        onChange={(e) => setEditItemPrice(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editItemAvailability}
                                        onChange={(e) => setEditItemAvailability(e.target.value)}
                                    />
                                    <button onClick={stopEditingAndUpdate}>Save</button>
                                    <button onClick={stopEditing}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    Name: {item.name} - Price: {item.price.toString()} - Quantity: {item.availability.toString()}
                                    <button onClick={() => startEditing(item)}>Edit</button>
                                    <button onClick={() => removeItem(item.id)}>Remove</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminMenu;