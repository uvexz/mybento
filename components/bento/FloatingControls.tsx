'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RiAddLine, RiBarChartFill, RiDownloadLine, RiUploadLine, RiCloseLine, RiInformationFill, RiLinkM, RiShieldUserLine, RiImageLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';

// Dynamic imports for better code splitting
const StatsPanel = dynamic(() => import('./StatsPanel'), { ssr: false });
const ExportImportButtons = dynamic(() => import('./ExportImportButtons'), { ssr: false });
const ShortLinkManager = dynamic(() => import('@/components/ShortLinkManager'), { ssr: false });
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), { ssr: false });
const ImageGallery = dynamic(() => import('@/components/ImageGallery'), { ssr: false });

interface FloatingControlsProps {
    onAddCard: () => void;
    userId?: string;
    isAdmin?: boolean;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({ onAddCard, userId, isAdmin = false }) => {
    const t = useTranslations();
    const [showStats, setShowStats] = useState(false);
    const [showExportImport, setShowExportImport] = useState(false);
    const [showShortLinks, setShowShortLinks] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showImageGallery, setShowImageGallery] = useState(false);

    return (
        <>
            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
                <div className="pointer-events-auto flex gap-3">
                    {/* Admin Button - Only for admins */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowAdmin(!showAdmin)}
                            className="bg-purple-600 p-3 sm:p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform text-white group"
                            title={t('floatingControls.admin')}
                        >
                            <RiShieldUserLine size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Analytics Button */}
                    {userId && (
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform text-gray-800 group"
                            title={t('floatingControls.analytics')}
                        >
                            <RiBarChartFill size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Export/Import Button */}
                    <button
                        onClick={() => setShowExportImport(!showExportImport)}
                        className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform text-gray-800 group"
                        title={t('floatingControls.exportImport')}
                    >
                        <RiDownloadLine size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Short Links Button */}
                    {userId && (
                        <button
                            onClick={() => setShowShortLinks(!showShortLinks)}
                            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform text-gray-800 group"
                            title={t('floatingControls.shortLinks')}
                        >
                            <RiLinkM size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Image Gallery Button */}
                    {userId && (
                        <button
                            onClick={() => setShowImageGallery(!showImageGallery)}
                            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform text-gray-800 group"
                            title={t('floatingControls.imageGallery')}
                        >
                            <RiImageLine size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Add Card Button */}
                    <button
                        onClick={onAddCard}
                        className="bg-blue-600 p-3 sm:p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform text-white group"
                        title={t('floatingControls.addCard')}
                    >
                        <RiAddLine size={20} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
                    </button>

                </div>
            </div>

            {/* Analytics Modal */}
            {showStats && userId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStats(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiBarChartFill size={20} />
                                {t('stats.title')}
                            </h2>
                            <button
                                onClick={() => setShowStats(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="border-b border-gray-200 p-4 flex justify-between items-center rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiUploadLine size={20} />
                                {t('dataManagement.title')}
                            </h2>
                            <button
                                onClick={() => setShowExportImport(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-gray-900">{t('dataManagement.backup')}</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {t('dataManagement.backupDesc')}
                                    </p>
                                    <ExportImportButtons />
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 flex items-start gap-1.5">
                                        <RiInformationFill size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>{t('dataManagement.tip')}</span>
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
                    <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiLinkM size={20} />
                                {t('shortLinks.title')}
                            </h2>
                            <button
                                onClick={() => setShowShortLinks(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

            {/* Admin Panel Modal */}
            {showAdmin && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdmin(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiShieldUserLine size={20} />
                                {t('admin.title')}
                            </h2>
                            <button
                                onClick={() => setShowAdmin(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AdminPanel />
                        </div>
                    </div>
                </div>
            )}

            {/* Image Gallery Modal */}
            {showImageGallery && userId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImageGallery(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiImageLine size={20} />
                                {t('imageGallery.title')}
                            </h2>
                            <button
                                onClick={() => setShowImageGallery(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <ImageGallery />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingControls;
