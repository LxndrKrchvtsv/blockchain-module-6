import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MultiSigABI from "./MultiSigWallet.json";
import "./App.css";

const CONTRACT_ADDRESS = "0xA477bF13c7bC67FA92F0A79DAEfF920B19952f4B";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [owners, setOwners] = useState([]);
  const [reqConf, setReqConf] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [data, setData] = useState("0x");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const network = await provider.getNetwork();
        console.log("================ DIAGNOSTIC ================");
        console.log("MetaMask Chain ID:", network.chainId.toString());
        console.log("Contract Address:", CONTRACT_ADDRESS);
        console.log("============================================");

        const signer = await provider.getSigner();

        const { chainId } = await provider.getNetwork();
        if (chainId !== 1114n) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x45A' }], // 0x45A = 1114 hex
            });
          } catch (switchError) {
            // Если сети нет, добавляем её
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x45A',
                  chainName: 'Core Blockchain Testnet 2',
                  nativeCurrency: { name: 'tCORE', symbol: 'tCORE', decimals: 18 },
                  rpcUrls: ['https://rpc.test2.btcs.network'],
                  blockExplorerUrls: ['https://scan.test2.btcs.network']
                }],
              });
            } else {
              alert("Please switch to Core Testnet 2 (Chain ID 1114)!");
              return;
            }
          }

          window.location.reload();
          return;
        }

        setAccount(await signer.getAddress());

        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MultiSigABI.abi,
          signer
        );
        setContract(tempContract);
        loadContractData(tempContract, provider);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadContractData = async (contractInstance, provider) => {
    try {
      const bal = await provider.getBalance(CONTRACT_ADDRESS);
      setBalance(ethers.formatEther(bal));

      const ownersList = await contractInstance.getOwners();
      setOwners(ownersList);

      const required = await contractInstance.numConfirmationsRequired();
      setReqConf(required.toString());

      const txCount = await contractInstance.getTransactionCount();
      const txs = [];

      for (let i = 0; i < txCount; i++) {
        const tx = await contractInstance.getTransaction(i);
        txs.push({
          index: i,
          to: tx[0],
          value: ethers.formatEther(tx[1]),
          data: tx[2],
          executed: tx[3],
          numConfirmations: tx[4].toString()
        });
      }
      setTransactions(txs);

    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const val = ethers.parseEther(amount);
      const tx = await contract.submitTransaction(to, val, data);
      await tx.wait();
      alert("Transaction Submitted!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error submitting transaction");
    }
  };

  const confirmTx = async (index) => {
    try {
      const tx = await contract.confirmTransaction(index);
      await tx.wait();
      alert("Confirmed!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error confirming");
    }
  };

  const executeTx = async (index) => {
    try {
      const tx = await contract.executeTransaction(index);
      await tx.wait();
      alert("Executed!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Execution failed (maybe not enough confirmations?)");
    }
  };

  useEffect(() => {
    if(window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }
  }, []);

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Multi-Sig Wallet DApp</h1>

      {!account ? (
        <button onClick={connectWallet} style={{fontSize: "18px", padding: "10px"}}>Connect Wallet</button>
      ) : (
        <div>
          <p><strong>Connected:</strong> {account}</p>
          <p><strong>Wallet Contract Balance:</strong> {balance} tCORE2</p>
          <p><strong>Required Confirmations:</strong> {reqConf}</p>
          <p><strong>Owners:</strong> {owners.join(", ")}</p>
        </div>
      )}

      <hr />

      <div style={{border: "1px solid #ccc", padding: "10px", margin: "20px 0"}}>
        <h3>Submit New Transaction</h3>
        <form onSubmit={submitTransaction}>
          <input
            placeholder="Recipient Address (0x...)"
            value={to} onChange={(e) => setTo(e.target.value)}
            style={{width: "300px", display: "block", marginBottom: "10px"}}
          />
          <input
            placeholder="Amount in ETH"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{width: "300px", display: "block", marginBottom: "10px"}}
          />
          <input
            placeholder="Data (0x for ETH transfer)"
            value={data} onChange={(e) => setData(e.target.value)}
            style={{width: "300px", display: "block", marginBottom: "10px"}}
          />
          <button type="submit">Submit</button>
        </form>
      </div>

      <h3>Transactions</h3>
      <table border="1" cellPadding="10" style={{width: "100%", borderCollapse: "collapse"}}>
        <thead>
        <tr>
          <th>ID</th>
          <th>To</th>
          <th>Value (ETH)</th>
          <th>Confirmations</th>
          <th>Executed</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {transactions.map((tx) => (
          <tr key={tx.index} style={{backgroundColor: tx.executed ? "#e0ffe0" : "#fff"}}>
            <td>{tx.index}</td>
            <td>{tx.to}</td>
            <td>{tx.value}</td>
            <td>{tx.numConfirmations} / {reqConf}</td>
            <td>{tx.executed ? "Yes" : "No"}</td>
            <td>
              {!tx.executed && (
                <>
                  <button onClick={() => confirmTx(tx.index)}>Confirm</button>
                  &nbsp;
                  <button onClick={() => executeTx(tx.index)}>Execute</button>
                </>
              )}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;