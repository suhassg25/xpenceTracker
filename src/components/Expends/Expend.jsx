import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { FaEdit, FaTrash } from 'react-icons/fa';

import StyleSheet from './Expend.module.css';

Modal.setAppElement('#root');

const categories = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Others'];
const COLORS = ['purple', 'yellow', 'orange', 'red', 'cyan'];

const Expend = () => {
    const [walletBalance, setWalletBalance] = useState(() => Number(localStorage.getItem('walletBalance')) || 5000);
    const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [form, setForm] = useState({ title: '', price: '', category: '', date: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [oldPrice, setOldPrice] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        localStorage.setItem('walletBalance', walletBalance);
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [walletBalance, expenses]);

    const handleIncomeSubmit = (e) => {
        e.preventDefault();
        const income = Number(e.target.income.value);
        if (income > 0) {
            setWalletBalance(walletBalance + income);
            enqueueSnackbar('Income added successfully', { variant: 'success' });
            setShowIncomeModal(false);
        } else {
            enqueueSnackbar('Invalid income, Please a valid amount', { variant: 'error' });
        }

    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        const { title, price, category, date } = form;
        const amount = Number(price);

        if (!title || !amount || !category || !date) {
            enqueueSnackbar('All fields are required', { variant: 'error' });
            return;
        }

        if (amount > walletBalance) {
            enqueueSnackbar('Insufficient wallet balance!, Add more balance or Reduce Expence', { variant: 'error' });
            return;
        }

        const newExpense = { title, price: amount, category, date };

        if (editIndex !== null) {
            expenses[editIndex] = newExpense;
            setExpenses([...expenses]);
            setWalletBalance(walletBalance + oldPrice - amount);
            setEditIndex(null);
            setOldPrice(0);
        }
        else {
            setExpenses([...expenses, newExpense]);
            setWalletBalance(walletBalance - price);
        }

        setForm({ title: '', price: '', category: '', date: '' });
        enqueueSnackbar('Expense saved', { variant: 'success' });
        setShowExpenseModal(false);
    };

    const handleDelete = (index) => {
        const expense = expenses[index];
        const updatedExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(updatedExpenses);
        setWalletBalance(walletBalance + expense.price);
        enqueueSnackbar('Expense deleted', { variant: 'info' });
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setOldPrice(expenses[index].price);
        setForm(expenses[index]);
        setShowExpenseModal(true);
    };

    const expenseSummary = categories.map((cat) => {
        const total = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.price, 0);
        return { name: cat, value: total };
    }).filter(e => e.value > 0);
    return (
        <div className="container mx-auto p-4 bg-gray-100 rounded shadow-lg" style={{ width: "100%", height: "100%" }}>

            <div className={StyleSheet.topRow} >
                <div className={StyleSheet.card}>
                    <h2>Wallet Balance: ₹ {walletBalance.toFixed(2)}</h2>

                    <button type="button" onClick={() => setShowIncomeModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">+ Add Income</button>
                </div>
                <div className={StyleSheet.card}>
                    <h2>Expenses: ₹ {expenses.reduce((t, i) => t + parseInt(i.price), 0)}</h2>
                    <button type="button" onClick={() => setShowExpenseModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">+ Add Expense</button>
                </div>
                <div className={StyleSheet.card2}>
                    <ResponsiveContainer >
                        <PieChart>
                            <Pie data={expenseSummary} dataKey="value" nameKey="value" outerRadius={90}  label >
                                {expenseSummary.map((entry, index) => (
                                    <Cell key={`cell-${entry}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={StyleSheet.completeTransactions}>

                <div className="mb-6" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: -20 }}>
                    <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
                    {expenses.length === 0 ? <p style={{ backgroundColor: "white", color: "black", borderRadius: 10, marginTop: -20 }}>No expenses added.</p> : (
                        <ul className="divide-y" style={{ backgroundColor: "white", color: "black", borderRadius: 10, marginTop: -20 }}>
                            {expenses.map((expense, index) => (
                                <li key={index} className="flex justify-between py-2" style={{ listStyle: "none", padding: 3 }}>
                                    <div className={StyleSheet.transactions}>
                                        <div>
                                            <p style={{ fontSize: 20, fontWeight: 600, margin: 0, padding: 0 }}>{expense.title}</p>
                                            <p style={{ fontWeight: 400, margin: 0, padding: 0, color: "grey" }}>{expense.date}</p>
                                        </div>
                                        <div className={StyleSheet.recentTransaction}>
                                            <p style={{ fontSize: 20, fontWeight: 600 }}>₹ {expense.price}</p>
                                            <button onClick={() => handleEdit(index)}><FaEdit /></button>
                                            <button onClick={() => handleDelete(index)}><FaTrash /></button>
                                        </div>
                                    </div>
                                    <hr />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4" style={{ marginTop: -20, width: "100%" }}>
                        <h2 className="text-lg font-semibold mb-2">Top Expenses</h2>
                    <div className={StyleSheet.width} style={{ backgroundColor: "white", color: "black", borderRadius: 10, marginTop: -10 }}> 
                        <ResponsiveContainer width="90%" height={300} >
                        <BarChart data={expenseSummary} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" tick={{ fill: 'black', fontWeight: 'bold', fontSize: 12, dx: 6 }} axisLine={false} tickLine={false}/>
                                <Bar dataKey="value" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <Modal isOpen={showIncomeModal} className={StyleSheet.modal} shouldCloseOnEsc={true} onRequestClose={() => setShowIncomeModal(false)}>
                <form onSubmit={handleIncomeSubmit} className={StyleSheet.modalContent}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 90 }}>
                        <h2 className="text-xl" style={{ margin: 0, padding: 0 }}>Add Balance</h2>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <input type="number" name="income" placeholder="Income Amount" required style={{ width: 150, height: 40, borderRadius: 10 }} />
                            <button type="submit" style={{ width: 140, borderRadius: 10, backgroundColor: "orange", color: "white" }}>Add Balance</button>
                            <button type="submit" style={{ width: 90, backgroundColor: "#a5a0a0", color: "white" }} onClick={() => setShowIncomeModal(false)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showExpenseModal} className={StyleSheet.modal} onRequestClose={() => setShowExpenseModal(false)} shouldCloseOnEsc={true}>
                <form onSubmit={handleExpenseSubmit} className={StyleSheet.modalContent} >
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <h2 className="text-xl mb-2" style={{ margin: 0, padding: 0 }}>{editIndex !== null ? 'Edit Expense' : 'Add Expense'}</h2>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
                                <input name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" style={{ width: 120, height: 35, borderRadius: 10 }} required />
                                <input name="price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" style={{ width: 120, height: 35, borderRadius: 10 }} required />
                            </div>
                            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
                                <select name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: 128, height: 40, borderRadius: 10 }} required>
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input name="date" type="date" value={form.date} style={{ width: 122, height: 40, borderRadius: 10 }} onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                            <div style={{ display: "flex", width: "100%", gap: 10, alignItems: "center" }}>
                                <button type="submit" style={{ width: 140, borderRadius: 10, backgroundColor: "orange", color: "white" }} >Add Expense</button>
                                <button type="submit" style={{ width: 90, backgroundColor: "#a5a0a0", color: "white" }} onClick={() => setShowExpenseModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const RootApp = () => (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000} sx={{ zIndex: 1000 }} anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}>
        <Expend />
    </SnackbarProvider>
);

export default RootApp;
