import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import PromotionDiscountContract from '../contracts/PromotionDiscount.json';
import MenuManagementContract from '../contracts/MenuManagement.json';
import './promotionAndDiscounts.css';

const PromotionAndDiscounts = ( {staffIndex} ) => {
    const [web3, setWeb3] = useState(null);
    const [promotionInstance, setPromotionInstance] = useState(null);
    const [menuInstance, setMenuInstance] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState();
    const [selectedItemPrice, setSelectedItemPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [validTillBlock, setValidTillBlock] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [latestBlock, setLatestBlock] = useState(0);


    useEffect(() => {
        const initWeb3AndLoadData = async () => {
            try {
                const web3Instance = new Web3(Web3.givenProvider || "http://localhost:7545");
                setWeb3(web3Instance);

                const networkId = await web3Instance.eth.net.getId();

                // Load menu items and promotions
                // const menuNetworkId = await web3Instance.eth.net.getId();
                const menuDeployedNetwork = MenuManagementContract.networks[networkId];
                const menuContractInstance = new web3Instance.eth.Contract(
                    MenuManagementContract.abi,
                    menuDeployedNetwork && menuDeployedNetwork.address,
                );
                setMenuInstance(menuContractInstance);

                const deployedNetwork = PromotionDiscountContract.networks[networkId];
                const promotionContractInstance = new web3Instance.eth.Contract(
                    PromotionDiscountContract.abi,
                    deployedNetwork && deployedNetwork.address,
                );
                setPromotionInstance(promotionContractInstance);

                // Load menu items from the MenuManagement contract
                await loadMenuItems(menuContractInstance);
                await loadPromotions(promotionContractInstance);

                // Fetch latest block number periodically
                const interval = setInterval(async () => {
                    const blockNumber = await web3Instance.eth.getBlockNumber();
                    setLatestBlock(blockNumber);
                }, 10000); // Update every 10 seconds

                return () => clearInterval(interval);
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        initWeb3AndLoadData();
    }, []);

    const loadMenuItems = async (menuContractInstance) => {
        try {
            // Ensure that promotionInstance is defined before using it
            if (!menuContractInstance) {
                console.error("Promotion contract instance is not available");
                return;
            }
    
            const items = await menuContractInstance.methods.getMenuItems().call();
            const formattedItems = items.map(item => ({
                id: item[0].toString(),
                name: item[1].toString(),
                price: item[2].toString(),
                availability: parseInt(item[3].toString()),
                promotionalPrice: null  // Initialize with null
            }));
    
            setMenuItems(formattedItems);

        // Check if there are items and select the first one
        } catch (error) {
            console.log('hello');
            console.error("Error loading menu items:", error);
        }
    };
    
    

    const loadPromotions = async () => {
        if (promotionInstance) {
            try {
                const accounts = await web3.eth.getAccounts();
                const promotions = await promotionInstance.methods.getAllPromotions().call( {from: accounts[staffIndex]});
                console.log("Promotions fetched:", promotions);
                setPromotions(promotions);
            } catch (error) {
                console.error("Error fetching promotions:", error);
            }
        } else {
            console.log("Promotion instance not initialized");
        }
    };

    const handleSelectedItemIdChange = (e) => {
        const itemId = e.target.value;
        setSelectedItemId(itemId);
        const selectedItem = menuItems.find(item => item.id === itemId);
        if (selectedItem) {
            setSelectedItemPrice(parseFloat(selectedItem.price));
        }
    };

    const HandleaddPromotion = async () => {
        const validTillBlockNumber = parseInt(validTillBlock);
        const discount = parseInt(discountPercentage);
        const des = description.toString();    
        // Validate inputs
        if (isNaN(validTillBlockNumber)) {
            console.log("Valid till block number is not a number.");
            return;
        }
    
        if (validTillBlockNumber <= 0) {
            console.log("Valid till block number must be greater than 0.");
            return;
        }
    
        if (isNaN(discount)) {
            console.log("Discount percentage is not a number.");
            return;
        }
    
        if (discount <= 0) {
            console.log("Discount percentage must be greater than 0.");
            return;
        }
    
        if (discount > 100) {
            console.log("Discount percentage must not be greater than 100.");
            return;
        }
    
        if (!selectedItemId) {
            console.log("No item selected for promotion.");
            return;
        }
     
        // Ensure selectedItemId is a number
        const itemId = parseInt(selectedItemId);
        if (isNaN(itemId)) {
            alert("Invalid item ID");
            return;
        }
    
        try {
            const accounts = await web3.eth.getAccounts();
            console.log("Selected Item ID:", itemId);
            console.log("Description:", description);
            console.log("Discount Percentage:", discount);
            console.log("Valid Till Block Number:", validTillBlockNumber);
            const gasLimit = await promotionInstance.methods.addPromotion(
                itemId, description, discount, validTillBlockNumber
            ).estimateGas({ from: accounts[staffIndex] });
            
            await promotionInstance.methods.addPromotion(
                itemId, description, discount, validTillBlockNumber
            ).send({ from: accounts[staffIndex], gas: gasLimit });
            
            console.log("Added promotion")
            loadPromotions();

        } catch (error) {
            console.error("Error adding promotion:", error);
        }
    };
    

    const updatePromotion = async () => {
        const validTillBlockNumber = parseInt(validTillBlock);
        const discount = parseInt(discountPercentage); 
        const itemId = parseInt(selectedItemId);
        
        if (isNaN(validTillBlockNumber) || validTillBlockNumber <= 0 || isNaN(discount) || discount <= 0 || discount > 100) {
            alert("Invalid input for updating promotion");
            return;
        }

        const accounts = await web3.eth.getAccounts();
        const gasLimit = await promotionInstance.methods.updatePromotion(itemId, description, discount, validTillBlockNumber).estimateGas({ from: accounts[staffIndex] });
        await promotionInstance.methods.updatePromotion(
            itemId,
            description,
            discount,
            validTillBlockNumber
        ).send({ from: accounts[staffIndex], gas: gasLimit });
        console.log("Updated")
        loadPromotions();

    };

    const removePromotion = async () => {
        if (!selectedItemId) {
            alert("No item selected for removing the promotion");
            return;
        }
        const itemId = parseInt(selectedItemId);

        const accounts = await web3.eth.getAccounts();
        const gasLimit = await promotionInstance.methods.deletePromotion(itemId).estimateGas({ from: accounts[staffIndex] });
        await promotionInstance.methods.deletePromotion(selectedItemId)
            .send({ from: accounts[staffIndex], gas: gasLimit });
        console.log("Deleted")
        loadPromotions();
    };

    return (
        <div className="promotion-and-discounts">
            <h1>Account: {staffIndex}</h1>
            <h1>Promotions and Discounts</h1>
            <div>
                <strong>Latest Block Number:</strong> {latestBlock.toString()}
            </div>
            {/* Promotion Management Form */}
            <div className="promotion-form">
                <div className="form-group">
                    <label>Item:</label>
                    <select value={selectedItemId} onChange={handleSelectedItemIdChange}>
                        {menuItems.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.id} - {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Discount Percentage:</label>
                    <input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Valid Till Block:</label>
                    <input
                        type="number"
                        value={validTillBlock}
                        onChange={(e) => setValidTillBlock(e.target.value)}
                    />
                </div>

                <div className="form-group action-buttons">
                    <button onClick={HandleaddPromotion}>Add Promotion</button>
                    <button onClick={updatePromotion}>Update Promotion</button>
                    <button onClick={removePromotion}>Remove Promotion</button>
                </div>
            </div>

            {/* Displaying Promotions */}
            <div className="promotions-list">
                <h2>Current Promotions</h2>
                {promotions.map((promotion, index) => (
                    // Add a condition to check if validTill is greater than zero
                    promotion.validTill > 0 && (
                        <div key={index} className="promotion-item">
                            <p><strong>Item ID:</strong> {promotion.itemId.toString()}</p>
                            <p><strong>Description:</strong> {promotion.description}</p>
                            <p><strong>Discount:</strong> {promotion.discountPercentage.toString()}%</p>
                            <p><strong>Valid Till Block:</strong> {promotion.validTill.toString()}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};



export default PromotionAndDiscounts;