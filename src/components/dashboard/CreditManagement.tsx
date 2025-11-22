/**
 * Credit Management Component
 * Beautiful Tailwind CSS-based credit management with tabs and Revo3 branding
 */

import React, { FC, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    getUserCredits, 
    getCreditUsageBreakdown, 
    getCreditTransactions,
    getPaymentHistory,
    CreditBalance, 
    CreditUsage 
} from '../../services/payments/creditService';
import { redirectToCheckout } from '../../services/payments/stripeService';
import { toast } from 'react-toastify';

// Icon Components (Simple SVG icons)
const CoinsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ZapIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TargetIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const BarChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const HistoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CreditCardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface Transaction {
    id: string;
    amount: number;
    credits: number;
    description: string;
    created_at: string;
    transaction_type: 'purchase' | 'usage';
}

export const CreditManagement: FC = () => {
    const { user, credits: contextCredits, refreshCredits } = useAuth();
    const [balance, setBalance] = useState<CreditBalance | null>(null);
    const [usageBreakdown, setUsageBreakdown] = useState<CreditUsage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState<string | null>(null);

    const loadCreditData = useCallback(async (isInitial = false, forceRefresh: boolean = true) => {
        if (!user) {
            if (!isInitial) {
                setError('Please sign in to view your credit information.');
            }
            setLoading(false);
            return;
        }

        if (isInitial) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            // Always force refresh to get latest data (invalidate cache)
            const [balanceData, usageData, transactionData, paymentData] = await Promise.all([
                getUserCredits(user.id, forceRefresh),
                getCreditUsageBreakdown(user.id, 20),
                getCreditTransactions(user.id, 20),
                getPaymentHistory(user.id, 20)
            ]);
            
            // Also refresh context credits
            await refreshCredits();

            setBalance(balanceData || { balance: 0, total_earned: 0, total_spent: 0 });
            setUsageBreakdown(usageData || []);

            // Transform transactions
            const transformedTransactions: Transaction[] = [];
            
            // Add purchase transactions from payments table
            paymentData?.forEach((payment: any) => {
                const pack = payment.credit_packs;
                if (pack) {
                    transformedTransactions.push({
                        id: payment.id,
                        amount: payment.amount_cents / 100, // Convert cents to dollars
                        credits: pack.credits || 0,
                        description: pack.name || 'Credit Purchase',
                        created_at: payment.created_at,
                        transaction_type: 'purchase'
                    });
                }
            });

            // Add purchase transactions from credit_transactions (fallback)
            transactionData?.forEach((t: any) => {
                if (t.transaction_type === 'purchase' && t.amount > 0) {
                    transformedTransactions.push({
                        id: t.id,
                        amount: 0, // Amount not stored in transactions table
                        credits: t.amount,
                        description: t.description || 'Credit Purchase',
                        created_at: t.created_at,
                        transaction_type: 'purchase'
                    });
                }
            });

            // Add usage transactions
            usageData?.forEach((u: CreditUsage) => {
                // Format feature type for display
                const featureName = u.feature_type
                    ? u.feature_type
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                    : 'Feature Usage';
                
                transformedTransactions.push({
                    id: `usage-${u.created_at}`,
                    amount: 0,
                    credits: -u.credits_used,
                    description: featureName + (u.platform ? ` (${u.platform})` : ''),
                    created_at: u.created_at,
                    transaction_type: 'usage'
                });
            });

            // Sort by date (newest first)
            transformedTransactions.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setTransactions(transformedTransactions.slice(0, 20));
        } catch (error) {
            console.error('Error loading credit data:', error);
            setError('Failed to load credit information. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, refreshCredits]);

    // Initial load
    useEffect(() => {
        if (user) {
            loadCreditData(true, true);
        }
    }, [user, loadCreditData]);

    // Sync with context credits when they update
    useEffect(() => {
        if (contextCredits && user) {
            setBalance(contextCredits);
        }
    }, [contextCredits, user]);

    // Listen for payment success in URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const payment = urlParams.get('payment');
        const sessionId = urlParams.get('session_id');
        
        if (payment === 'success' && sessionId) {
            // Refresh data immediately
            loadCreditData(false, true);
            
            // Also refresh after a delay to ensure webhook processed
            const timeoutId = setTimeout(() => {
                loadCreditData(false, true);
            }, 3000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [loadCreditData]);

    // Set up polling to refresh credits every 30 seconds when on this page
    useEffect(() => {
        if (!user) return;
        
        const intervalId = setInterval(() => {
            loadCreditData(false, true);
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(intervalId);
    }, [user, loadCreditData]);

    const handleBuyCredits = async (priceId: string) => {
        try {
            await redirectToCheckout(priceId);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start checkout. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const usagePercentage = balance && balance.total_earned > 0
        ? Math.round((balance.total_spent / balance.total_earned) * 100)
        : 0;

    if (loading) {
        return (
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#571c86] mb-4"></div>
                        <p className="text-gray-600">Loading credit information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !balance) {
        return (
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="flex items-center space-x-2 text-red-600 mb-4">
                        <AlertCircleIcon />
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={() => loadCreditData(true)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const creditBalance = balance || { balance: 0, total_earned: 0, total_spent: 0 };

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {refreshing && (
                <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm text-gray-600 border border-gray-200">
                    Refreshing credits...
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Credit Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Track your credits, usage, and purchase history</p>
                </div>
                <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#571c86] text-white rounded-lg font-semibold hover:bg-[#6a2d9b] transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                >
                    <PlusIcon />
                    Buy More Credits
                </Link>
            </div>

            {/* Credit Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Credits */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Total Credits</h3>
                        <div className="text-gray-400">
                            <CoinsIcon />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {creditBalance.total_earned || 0}
                    </div>
                    <p className="text-xs text-gray-500">All-time purchased credits</p>
                </div>

                {/* Remaining Credits */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Remaining Credits</h3>
                        <div className="text-green-600">
                            <ZapIcon />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {creditBalance.balance || 0}
                    </div>
                    <p className="text-xs text-gray-500">Available for use</p>
                </div>

                {/* Used Credits */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Used Credits</h3>
                        <div className="text-blue-600">
                            <TrendingUpIcon />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {creditBalance.total_spent || 0}
                    </div>
                    <p className="text-xs text-gray-500">Credits consumed</p>
                </div>

                {/* Usage */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Usage</h3>
                        <div className="text-orange-600">
                            <TargetIcon />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                        {usagePercentage}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-[#571c86] to-[#6a2d9b] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'overview'
                                    ? 'text-[#571c86] border-b-2 border-[#571c86] bg-white'
                                    : 'text-gray-600 hover:text-[#571c86] hover:bg-gray-50'
                            }`}
                        >
                            <span className="hidden sm:inline">Overview</span>
                            <span className="sm:hidden">📊</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'history'
                                    ? 'text-[#571c86] border-b-2 border-[#571c86] bg-white'
                                    : 'text-gray-600 hover:text-[#571c86] hover:bg-gray-50'
                            }`}
                        >
                            <span className="hidden sm:inline">Purchase History</span>
                            <span className="sm:hidden">🛒</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'plans'
                                    ? 'text-[#571c86] border-b-2 border-[#571c86] bg-white'
                                    : 'text-gray-600 hover:text-[#571c86] hover:bg-gray-50'
                            }`}
                        >
                            <span className="hidden sm:inline">Available Plans</span>
                            <span className="sm:hidden">💳</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Credit Usage Breakdown */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChartIcon />
                                        <h3 className="text-lg font-semibold text-gray-900">Credit Usage Breakdown</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Available Credits</span>
                                            <span className="font-semibold text-green-600">
                                                {creditBalance.balance || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Used Credits</span>
                                            <span className="font-semibold text-gray-900">
                                                {creditBalance.total_spent || 0}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between font-semibold">
                                                <span className="text-gray-900">Total Credits</span>
                                                <span className="text-gray-900">{creditBalance.total_earned || 0}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-[#571c86] to-[#6a2d9b] h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${usagePercentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 text-center mt-2">
                                                {usagePercentage}% of credits used
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CalendarIcon />
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    </div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {transactions.length > 0 ? (
                                            transactions.slice(0, 10).map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(transaction.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p
                                                            className={`text-sm font-semibold ${
                                                                transaction.credits >= 0
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                        >
                                                            {transaction.credits > 0 ? '+' : ''}
                                                            {transaction.credits} credits
                                                        </p>
                                                        {transaction.amount > 0 && (
                                                            <p className="text-xs text-gray-500">
                                                                ${transaction.amount.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-gray-500 mb-4">No recent activity yet</p>
                                                <Link
                                                    to="/pricing"
                                                    className="inline-block px-4 py-2 bg-[#571c86] text-white rounded-lg text-sm font-medium hover:bg-[#6a2d9b] transition-colors"
                                                >
                                                    Get Started
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Low Credits Warning */}
                            {creditBalance.balance < 10 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                    <div className="flex items-center space-x-3">
                                        <AlertCircleIcon />
                                        <div className="flex-1">
                                            <p className="font-semibold text-orange-800">Low Credits Warning</p>
                                            <p className="text-sm text-orange-700 mt-1">
                                                You have {creditBalance.balance} credits remaining. Consider purchasing more to continue using our services.
                                            </p>
                                        </div>
                                        <Link
                                            to="/pricing"
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors whitespace-nowrap"
                                        >
                                            Buy Credits
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Purchase History Tab */}
                    {activeTab === 'history' && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <HistoryIcon />
                                <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
                            </div>
                            {transactions.filter(t => t.transaction_type === 'purchase').length > 0 ? (
                                <div className="space-y-4">
                                    {transactions
                                        .filter(t => t.transaction_type === 'purchase')
                                        .map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-3 h-3 rounded-full bg-[#571c86]"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(transaction.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">
                                                        +{transaction.credits} credits
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ${transaction.amount.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <CreditCardIcon />
                                    </div>
                                    <p className="text-gray-600 mb-2">No purchase history yet</p>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Your credit purchases will appear here
                                    </p>
                                    <Link
                                        to="/pricing"
                                        className="inline-block px-6 py-3 bg-[#571c86] text-white rounded-lg font-semibold hover:bg-[#6a2d9b] transition-colors"
                                    >
                                        Buy Your First Credits
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Available Plans Tab */}
                    {activeTab === 'plans' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Credit Packs</h3>
                            <div className="grid gap-6 md:grid-cols-3">
                                {[
                                    { id: 'price_1SWENdI1WHS4nwXdw2ZCIf1H', name: 'Free Starter', credits: 10, price: 0, popular: false },
                                    { id: 'price_1SWEQdI1WHS4nwXdb9wSvgKl', name: 'Starter Pack', credits: 50, price: 9, popular: false },
                                    { id: 'price_1SWEUAI1WHS4nwXduy1uQkYn', name: 'Pro Pack', credits: 200, price: 29, popular: true },
                                    { id: 'price_1SWF5BI1WHS4nwXdQCv58CeN', name: 'Enterprise Pack', credits: 1000, price: 99, popular: false }
                                ].map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`bg-white rounded-xl border-2 p-6 ${
                                            plan.popular
                                                ? 'border-[#571c86] shadow-lg'
                                                : 'border-gray-200 hover:border-[#571c86] transition-colors'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                                            {plan.popular && (
                                                <span className="px-3 py-1 bg-[#571c86] text-white text-xs font-semibold rounded-full">
                                                    Most Popular
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
                                                <p className="text-sm text-gray-500">One-time purchase</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{plan.credits} Credits</p>
                                                {plan.price > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        ${(plan.price / plan.credits).toFixed(3)} per credit
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleBuyCredits(plan.id)}
                                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                    plan.popular
                                                        ? 'bg-[#571c86] text-white hover:bg-[#6a2d9b]'
                                                        : 'bg-gray-100 text-[#571c86] hover:bg-gray-200 border border-[#571c86]'
                                                }`}
                                            >
                                                {plan.price === 0 ? 'Get Started' : `Purchase ${plan.name}`}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
