# Decentralized Cafeteria Shopping System

## Introduction
Welcome to the Decentralized Cafeteria Shopping System, a pioneering DAPP (Decentralized Application). This project strives to transform cafeteria interactions, utilizing blockchain for efficient meal ordering, secure transactions, and a rewarding system.

## Project Overview
Our system connects university management, cafeteria staff, and users in a seamless, blockchain-powered environment. It enhances the cafeteria experience through efficient order processing, cryptocurrency payments, and a loyalty program.

### Features
- **Menu Management**: Enables cafeteria staff to update the menu, adjust prices, and manage item availability.
- **Order Processing**: Users can easily select, order, and customize their meals.
- **FastCoin Payments**: Transactions are made using FastCoin, our custom ERC20 token.
- **Loyalty Rewards**: A rewarding system that benefits regular customers.
- **Promotions**: Dynamic discounts and special offers.

### Technology Stack
- **Smart Contracts**: Developed on the Ethereum blockchain using Solidity.
- **Front-End**: Implemented with JavaScript and the React framework.
- **Tokenomics**: FastCoin, following the ERC20 token standard.

## How to Run the Project

To run the Decentralized Cafeteria Shopping System, follow these detailed steps:

### Prerequisites
- Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
- Install [Ganache](https://www.trufflesuite.com/ganache) for a personal Ethereum blockchain.
- Install [Truffle](https://www.trufflesuite.com/truffle) for smart contract compilation and deployment.

### Steps

#### Setting Up the Environment
1. **Clone the Repository:**
   - Open your terminal.
   - Run the command `git clone https://github.com/Ahmed1282/Decentralized-Cafeteria-Shopping-System.git` to clone the repository.

2. **Navigate to the Project Directory:**
   - After cloning, navigate to the project directory with `cd Decentralized-Cafeteria-Shopping-System`.

3. **Install Dependencies:**
   - In the project directory, run `npm install` to install all the required dependencies.

#### Running the Blockchain and Migrations
4. **Open Ganache:**
   - Launch Ganache to create your personal Ethereum blockchain.

5. **Migrate Contracts:**
   - Open a new terminal window (do not close the previous one).
   - Ensure you are in the root directory of the project (not inside `client`).
   - Run the command `truffle migrate` to deploy your contracts to the blockchain.

#### Running the Client Application
6. **Navigate to Client Directory:**
   - In the first terminal, navigate to the client directory with `cd client`.

7. **Start the Client Application:**
   - Run `npm start` to start the client-side application.

8. **Access the Application:**
   - Open your browser and go to `localhost:3000` to interact with the application.

## Additional Information

- This project uses Ganache for a simulated blockchain environment.
- Ensure all dependencies are installed before running the project.

## Troubleshooting

- If you encounter any issues, make sure all prerequisites are correctly installed, your Ganache instance is running, and you are using two separate terminals as instructed.
