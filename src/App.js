import { Profiler, useState } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';
import './App.css';

const greeterAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const tokenAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

function App() {
  const [greeting, setGreetingValue] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState(0);

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
      const balance = await contract.balanceOf(account);
      console.log('Balance of: ', balance.toString());
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();

      setAmount(0);
      setUserAccount('');
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }

  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        provider
      );
      try {
        const data = await contract.greet();
        console.log('data: ', data);
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  }

  async function setGreeting() {
    if (!greeting) {
      return;
    }
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      setGreetingValue('');
      await transaction.wait();
      fetchGreeting();
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    setGreeting();
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <form onSubmit={handleSubmit}>
          <input
            placeholder='Set Greeting...'
            type='text'
            onChange={(e) => {
              setGreetingValue(e.target.value);
            }}
            value={greeting}
            required
          />
          <button type='submit'>Set Greeting</button>
        </form>

        <hr />
        <button onClick={getBalance}>Get Balance</button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(amount, userAccount);
            sendCoins();
          }}
        >
          <input
            type='number'
            placeholder='amount...'
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
          <input
            type='text'
            placeholder='user account...'
            value={userAccount}
            onChange={(e) => {
              setUserAccount(e.target.value);
            }}
          />
          <button type='submit'>Send</button>
        </form>
      </header>
    </div>
  );
}

export default App;
