'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RiAddLine, RiBarChartFill, RiDownloadLine, RiUploadLine, RiCloseLine, RiInformationFill, RiLinkM } from '@remixicon/react';

// Dynamic imports for better code splitting
const StatsPanel = dynamic(() => import('./StatsPanel'), { ssr: false });
const ExportImportButtons = dynamic(() => import('./ExportImportButtons'), { ssr: false });
const ShortLinkManager = dynamic(() => import('@/components/ShortLinkManager'), { ssr: false });

interface FloatingControlsProps {
    onAddCard: () => void;
    userId?: string;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({ onAddCard, userId }) => {
    const [showStats, setShowStats] = useState(false);
    const [showExportImport, setShowExportImport] = useState(false);
    const [showShortLinks, setShowShortLinks] = useState(false);

    return (
        <>
            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
                <div className="pointer-events-auto flex gap-3">
                    {/* Analytics Button */}
                    {userId && (
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform text-gray-800 dark:text-white group"
                            title="Analytics"
                        >
                            <RiBarChartFill size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Add Card Button */}
                    <button
                        onClick={onAddCard}
                        className="bg-blue-600 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform text-white group"
                        title="Add New Card"
                    >
                        <RiAddLine size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>

                    {/* Export/Import Button */}
                    <button
                        onClick={() => setShowExportImport(!showExportImport)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform text-gray-800 dark:text-white group"
                        title="Export/Import"
                    >
                        <RiDownloadLine size={24} className="group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Short Links Button */}
                    {userId && (
                        <button
                            onClick={() => setShowShortLinks(!showShortLinks)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform text-gray-800 dark:text-white group"
                            title="Short Links"
                        >
                            <RiLinkM size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* Analytics Modal */}
            {showStats && userId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStats(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <RiBarChartFill size={20} />
                                Analytics
                            </h2>
                            <button
                                onClick={() => setShowStats(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <StatsPanel userId={userId} />
                        </div>
                    </div>
                </div>
            )}

            {/* Export/Import Modal */}
            {showExportImport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportImport(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <RiUploadLine size={20} />
                                Data Management
                            </h2>
                            <button
                                onClick={() => setShowExportImport(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Backup Your Data</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Export all your cards and profile data as JSON
                                    </p>
                                    <ExportImportButtons />
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                                        <RiInformationFill size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Tip: Export regularly to backup your data. You can import the JSON file later to restore.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Short Links Modal */}
            {showShortLinks && userId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShortLinks(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <RiLinkM size={20} />
                                Short Links
                            </h2>
                            <button
                                onClick={() => setShowShortLinks(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <ShortLinkManager />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingControls;
