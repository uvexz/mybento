'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { RiPencilFill, RiSaveLine, RiCloseLine, RiQrCodeLine, RiLoader4Line, RiHomeLine, RiLoginBoxLine, RiLogoutBoxLine, RiGithubFill } from '@remixicon/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/lib/actions';
import ImageUpload from '@/components/ImageUpload';
import QRCodeModal from '@/components/QRCodeModal';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddPageModal from '@/components/AddPageModal';
import { Page } from '@/lib/types';

interface ProfileSectionProps {
    profile: UserProfile;
    setProfile?: (profile: UserProfile) => void;
    isEditable?: boolean;
    username?: string;
    isLoggedIn?: boolean;
    pages?: Page[];
    currentPageSlug?: string; // Current page slug for page switcher
    currentPageId?: string; // Current page ID if editing a page (not main profile)
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, setProfile, isEditable = false, username, isLoggedIn = false, pages = [], currentPageSlug, currentPageId }) => {
    const t = useTranslations();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const [isSaving, setIsSaving] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showAddPage, setShowAddPage] = useState(false);

    const profileUrl = typeof window !== 'undefined' && username
        ? `${window.location.origin}/${username}`
        : '';

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push('/');
                    },
                    onError: () => {
                        setIsLoggingOut(false);
                    },
                },
            });
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            
            // Check if we're editing a page or the main profile
            if (currentPageId) {
                // Editing a page
                const { updatePage } = await import('@/lib/actions');
                formData.append('title', editedProfile.name);
                formData.append('subtitle', editedProfile.bio);
                formData.append('avatarUrl', editedProfile.avatarUrl);
                formData.append('backgroundImage', editedProfile.backgroundImage || '');
                formData.append('profileColor', editedProfile.profileColor || '');

                const result = await updatePage(currentPageId, formData);
                if (result.success) {
                    setProfile?.(editedProfile);
                    setIsEditing(false);
                    router.refresh();
                } else {
                    console.error(result.error);
                }
            } else {
                // Editing main profile
                formData.append('name', editedProfile.name);
                formData.append('bio', editedProfile.bio);
                formData.append('image', editedProfile.avatarUrl);
                formData.append('backgroundImage', editedProfile.backgroundImage || '');
                formData.append('profileColor', editedProfile.profileColor || '');

                const result = await updateProfile(formData);
                if (result.success) {
                    setProfile?.(editedProfile);
                    setIsEditing(false);
                } else {
                    console.error(result.error);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePageChange = (value: string) => {
        if (value === 'add-new') {
            setShowAddPage(true);
        } else if (value === 'main') {
            router.push(`/${username}`);
        } else {
            router.push(`/${username}/${value}`);
        }
    };

    // Use the currentPageSlug prop, default to 'main' if not provided
    const selectedValue = currentPageSlug || 'main';

    if (isEditing) {
        return (
            <div className="flex flex-col p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto lg:mx-0 self-start w-full z-10">
                <h2 className="text-xl font-bold mb-4">{t('profile.editProfile')}</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('common.name')}</Label>
                        <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="bio">{t('common.bio')}</Label>
                        <Textarea
                            id="bio"
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="avatar">{t('common.avatar')}</Label>
                        <ImageUpload
                            value={editedProfile.avatarUrl}
                            onChange={(url) => setEditedProfile({ ...editedProfile, avatarUrl: url })}
                            folder="avatars"
                            placeholder={t('profile.avatarPlaceholder')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="background">{t('common.background')}</Label>
                        <ImageUpload
                            value={editedProfile.backgroundImage || ''}
                            onChange={(url) => setEditedProfile({ ...editedProfile, backgroundImage: url })}
                            folder="backgrounds"
                            placeholder={t('profile.backgroundPlaceholder')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="color">{t('common.color')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="color"
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                value={editedProfile.profileColor || '#ffffff'}
                                onChange={(e) => setEditedProfile({ ...editedProfile, profileColor: e.target.value })}
                            />
                            <Input
                                value={editedProfile.profileColor || ''}
                                placeholder={t('profile.colorPlaceholder')}
                                onChange={(e) => setEditedProfile({ ...editedProfile, profileColor: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" /> : <RiSaveLine className="w-4 h-4 mr-2" />}
                            {t('common.save')}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                            <RiCloseLine className="w-4 h-4 mr-2" />
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center text-center p-8 max-w-md mx-auto lg:mx-0 lg:items-start lg:text-left lg:sticky lg:top-20 self-start relative group rounded-xl transition-colors duration-300"
            style={{ backgroundColor: profile.profileColor || 'rgba(255, 255, 255, 0.8)' }}
        >
            <div className="relative">
                <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    loading="lazy"
                    className="w-40 h-40 rounded-full object-cover mb-6 shadow-lg border-4 border-white"
                />
                {isEditable && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                        title={t('profile.editProfile')}
                    >
                        <RiPencilFill className="w-4 h-4 text-gray-600" />
                    </button>
                )}
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{profile.name}</h1>

            <div className="relative w-full">
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                    {profile.bio}
                </p>
            </div>

            {/* Action Buttons */}
            {username && (
                <TooltipProvider>
                    <div className="flex gap-2 mt-4">
                        {/* Home Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href="/">
                                        <RiHomeLine className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('common.homepage')}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* GitHub Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href="https://github.com/uvexz/mybento" target='_blank'>
                                        <RiGithubFill className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('common.openSource')}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* QR Code Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQRCode(true)}
                                >
                                    <RiQrCodeLine className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('qrcode.title')}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Login/Logout Button */}
                        {isLoggedIn ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <RiLoader4Line className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <RiLogoutBoxLine className="w-4 h-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('nav.logout')}</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href="/login">
                                            <RiLoginBoxLine className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('common.signin')}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </TooltipProvider>
            )}

            {/* Page Switcher - Only show if there are pages to switch between */}
            {username && pages.length > 0 && (
                <div className="w-full mt-6">
                    <Select onValueChange={handlePageChange} value={selectedValue}>
                        <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gray-200">
                            <SelectValue placeholder={t('pages.selectPage')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="main">{t('pages.mainProfile')}</SelectItem>
                            {pages.map((page) => (
                                <SelectItem key={page.id} value={page.slug}>
                                    {page.title}
                                </SelectItem>
                            ))}
                            {isEditable && (
                                <>
                                    <div className="h-px bg-gray-100 my-1" />
                                    <SelectItem value="add-new" className="text-blue-600 font-medium">
                                        + {t('pages.addNewPage')}
                                    </SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* QR Code Modal */}
            <QRCodeModal
                isOpen={showQRCode}
                onClose={() => setShowQRCode(false)}
                url={profileUrl}
                title={profile.name}
                username={username}
            />

            {/* Add Page Modal */}
            {username && (
                <AddPageModal
                    isOpen={showAddPage}
                    onClose={() => setShowAddPage(false)}
                    username={username}
                />
            )}
        </div>
    );
};

export default ProfileSection;
