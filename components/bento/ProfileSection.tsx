import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/lib/actions';

interface ProfileSectionProps {
    profile: UserProfile;
    setProfile?: (profile: UserProfile) => void;
    isEditable?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, setProfile, isEditable = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-col p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto lg:mx-0 self-start w-full z-10">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                            id="avatar"
                            value={editedProfile.avatarUrl}
                            onChange={(e) => setEditedProfile({ ...editedProfile, avatarUrl: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="background">Background Image URL</Label>
                        <Input
                            id="background"
                            value={editedProfile.backgroundImage || ''}
                            onChange={(e) => setEditedProfile({ ...editedProfile, backgroundImage: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="color">Profile Background Color</Label>
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
                                placeholder="e.g. rgba(255, 255, 255, 0.8)"
                                onChange={(e) => setEditedProfile({ ...editedProfile, profileColor: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
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
                    className="w-40 h-40 rounded-full object-cover mb-6 shadow-lg border-4 border-white"
                />
                {isEditable && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Profile"
                    >
                        <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                )}
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{profile.name}</h1>

            <div className="relative w-full">
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                    {profile.bio}
                </p>
            </div>
        </div>
    );
};

export default ProfileSection;
