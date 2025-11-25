import React from 'react';
import {
    RiUserSettingsLine,
    RiImageLine,
    RiLayoutGridLine,
    RiLinkM,
    RiSave3Line,
    RiPagesLine
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export interface UserPermissions {
    canUploadImages: boolean;
    maxImages: number;
    maxShortLinks: number;
    maxCards: number;
    maxPages: number;
}

interface PermissionsSettingsProps {
    permissions: UserPermissions;
    setPermissions: (permissions: UserPermissions) => void;
    onSave: () => void;
    saving: boolean;
}

const PermissionsSettings: React.FC<PermissionsSettingsProps> = ({ permissions, setPermissions, onSave, saving }) => {
    const t = useTranslations();

    return (
        <div className="space-y-6 py-2">
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-200/50">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <RiUserSettingsLine size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{t('admin.permissionsInfo')}</span>
                </p>
            </div>

            {/* Upload Permissions Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiImageLine size={16} className="text-gray-500" />
                    Image Upload Permissions
                </h3>
                <div className="space-y-4 pl-6">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <input
                            type="checkbox"
                            id="canUploadImages"
                            checked={permissions.canUploadImages}
                            onChange={(e) => setPermissions({ ...permissions, canUploadImages: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <div className="flex-1">
                            <Label htmlFor="canUploadImages" className="cursor-pointer font-medium text-gray-900">
                                {t('admin.canUploadImages')}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{t('admin.canUploadImagesDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxImages" className="text-sm font-medium text-gray-700">
                            {t('admin.maxImages')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiImageLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="maxImages"
                                type="number"
                                min="0"
                                value={permissions.maxImages}
                                onChange={(e) => setPermissions({ ...permissions, maxImages: parseInt(e.target.value) || 0 })}
                            />
                        </InputGroup>
                        <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxImagesDesc')}</p>
                    </div>
                </div>
            </div>

            {/* Content Limits Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiLayoutGridLine size={16} className="text-gray-500" />
                    Content Limits
                </h3>
                <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                        <Label htmlFor="maxCards" className="text-sm font-medium text-gray-700">
                            {t('admin.maxCards')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiLayoutGridLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="maxCards"
                                type="number"
                                min="1"
                                value={permissions.maxCards}
                                onChange={(e) => setPermissions({ ...permissions, maxCards: parseInt(e.target.value) || 1 })}
                            />
                        </InputGroup>
                        <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxCardsDesc')}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxShortLinks" className="text-sm font-medium text-gray-700">
                            {t('admin.maxShortLinks')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiLinkM />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="maxShortLinks"
                                type="number"
                                min="0"
                                value={permissions.maxShortLinks}
                                onChange={(e) => setPermissions({ ...permissions, maxShortLinks: parseInt(e.target.value) || 0 })}
                            />
                        </InputGroup>
                        <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxShortLinksDesc')}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxPages" className="text-sm font-medium text-gray-700">
                            {t('admin.maxPages')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiPagesLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="maxPages"
                                type="number"
                                min="1"
                                value={permissions.maxPages}
                                onChange={(e) => setPermissions({ ...permissions, maxPages: parseInt(e.target.value) || 1 })}
                            />
                        </InputGroup>
                        <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxPagesDesc')}</p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
                <Button onClick={onSave} disabled={saving} className="w-full">
                    <RiSave3Line size={18} className="mr-2" />
                    {saving ? t('common.loading') : t('common.save')}
                </Button>
            </div>
        </div>
    );
};

export default PermissionsSettings;
