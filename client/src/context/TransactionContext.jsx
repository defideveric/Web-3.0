import React, {useEffect, useState} from "react";
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEtheruemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

export const TransactionProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({address: '', amount:'', keyword:'', message:''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    };

    const getAllTransactions = async () => {
        try {
            if(ethereum)  {
            const transactionContract = getEtheruemContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) =>({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));

            console.log(structuredTransactions)

            setTransactions(structuredTransactions);
        } else {
            console.log("Ethereum not present");
            }
        } catch (error) {
        console.log(error);
        }
    };



    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts'});

            if(accounts.length) {
                setCurrentAccount(accounts[0]);

            getAllTransactions();
            } else {
                console.log("No accounts found");
            }     
            } catch (error) {
                console.log(error);
        }
        
    };

    const checkIfTransactionsExist = async () => {
        try {
            if (ethereum) {
            const transactionContract = getEtheruemContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);
            }
        } catch (error) {
        console.log(error)
        throw new Error("No Ethereum Object");     
        }
    };

    const sendTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask");

        const { address, amount, keyword, message } = formData;
        const transactionContract = getEtheruemContract(); 
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: currentAccount,
                to: address,
                gas: '0x5208', //21000 GWEI
                value: parsedAmount._hex, //0.0001
            }]
        });

        const transactionHash = await transactionContract.addToBlockchain(address, parsedAmount, message, keyword);
        
        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        setIsLoading(false);
        console.log(`Success - ${transactionHash.hash}`);

        const transactionCount = await transactionContract.getTransactionCount();

        setTransactionCount(transactionCount.toNumber());

        window.reload()
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum Object");
            
        }
    };
       

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum Object");
        }
    }
    


    useEffect(() => {
      checkIfWalletIsConnected();
      checkIfTransactionsExist();
    }, []);
    

    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, handleChange, sendTransactions, isLoading}}>
            {children}
        </TransactionContext.Provider>
    );
}