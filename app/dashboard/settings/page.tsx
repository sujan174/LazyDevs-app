"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthProvider';
import { User, Shield, Upload, Trash2, Camera, Link as LinkIcon, Loader2, X, CheckCircle } from 'lucide-react';

const auth = getAuth(app);
const db = getFirestore(app);

// Integration Logo Components
const ClickUpLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2383 1.73828C11.5834 1.03613 12.4166 1.03613 12.7617 1.73828L15.3121 7.03217C15.4419 7.2998 15.6908 7.48828 15.9839 7.5457L21.7354 8.54924C22.4996 8.68652 22.809 9.58008 22.2514 10.1131L18.0645 14.1205C17.857 14.3184 17.7554 14.6063 17.7946 14.8945L18.8239 20.606C18.9818 21.3662 18.239 21.9213 17.5532 21.5541L12.2974 18.7035C12.0357 18.563 11.7243 18.563 11.4626 18.7035L6.20678 21.5541C5.521 21.9213 4.77816 21.3662 4.93603 20.606L5.96532 14.8945C6.00453 14.6063 5.90291 14.3184 5.69542 14.1205L1.50848 10.1131C0.950854 9.58008 1.26029 8.68652 2.02451 8.54924L7.77605 7.5457C8.06925 7.48828 8.31811 7.2998 8.44786 7.03217L11.2383 1.73828Z" fill="url(#paint0_linear_1_2)"/><defs><linearGradient id="paint0_linear_1_2" x1="12" y1="1" x2="12" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#ff5555"/><stop offset="1" stopColor="#ff0000"/></linearGradient></defs></svg>
);

const JiraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.53 2c0 2.4 1.97 4.37 4.37 4.37h.1v4.24c-2.4 0-4.37 1.97-4.37 4.37v.1H7.39c0-2.4-1.97-4.37-4.37-4.37v-4.24c2.4 0 4.37-1.97 4.37-4.37h4.14z" fill="#2684FF"/>
    <path d="M15.87 6.37h4.14c0 2.4 1.97 4.37 4.37 4.37v4.24c-2.4 0-4.37 1.97-4.37 4.37h-4.14c0-2.4-1.97-4.37-4.37-4.37v-4.24c2.4 0 4.37-1.97 4.37-4.37z" fill="url(#jiraGradient)"/>
    <defs>
      <linearGradient id="jiraGradient" x1="20.38" y1="6.37" x2="11.5" y2="15.24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2684FF"/>
        <stop offset="1" stopColor="#0052CC"/>
      </linearGradient>
    </defs>
  </svg>
);

const SlackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <g><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/><path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/><path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/></g>
  </svg>
);

const GitHubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const NotionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
  </svg>
);

type UserProfile = FirebaseUser & {
    teamId?: string;
};

interface Integration {
    accessToken: string;
    connected: boolean;
    connectedAt: any;
    updatedAt?: any;
}

interface TeamData {
    integrations?: {
        clickup?: Integration;
        jira?: Integration;
        slack?: Integration;
        github?: Integration;
        notion?: Integration;
    }
}

const ProfileSettings = ({ user }: { user: UserProfile | null }) => {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (user?.displayName) {
            setFullName(user.displayName);
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            await updateProfile(user, { displayName: fullName });
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { name: fullName }, { merge: true });
            
            setMessage({ type: 'success', content: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Error updating profile: ", error);
            setMessage({ type: 'error', content: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Profile</h2>
            <p className="text-gray-500 mb-6">This is how your name will appear in transcripts.</p>
            <form onSubmit={handleProfileUpdate}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            id="fullName" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full max-w-md bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-4">
                    {message.content && (
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.content}</p>
                    )}
                    <button type="submit" disabled={loading} className="btn-primary inline-flex items-center disabled:bg-indigo-400">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

const SecuritySettings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });
        const user = auth.currentUser;

        if (!user) {
            setMessage({ type: 'error', content: 'No user is signed in.' });
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', content: 'New passwords do not match.' });
            setLoading(false);
            return;
        }

        try {
            if (!user.email) {
                throw new Error("User email is not available for re-authentication.");
            }
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setMessage({ type: 'success', content: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error updating password: ", error);
            setMessage({ type: 'error', content: 'Failed to update password. Please check your current password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Password</h2>
            <p className="text-gray-500 mb-6">Update the password associated with your account.</p>
            <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-6 max-w-md">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="input-field" />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-field" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field" />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-4">
                     {message.content && (
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.content}</p>
                    )}
                    <button type="submit" disabled={loading} className="btn-primary inline-flex items-center disabled:bg-indigo-400">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

// Integrations component with all providers
const Integrations = ({ teamId, teamData, onDisconnectIntegration }: {
    teamId: string | null;
    teamData: TeamData | null;
    onDisconnectIntegration: (provider: string) => void;
}) => {
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    const integrations = [
        {
            id: 'jira',
            name: 'Jira',
            description: 'Manage tasks and issues from your meetings',
            icon: JiraIcon,
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Send meeting summaries to your channels',
            icon: SlackIcon,
        },
        {
            id: 'github',
            name: 'GitHub',
            description: 'Create issues from meeting action items',
            icon: GitHubIcon,
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Sync meeting notes to your workspace',
            icon: NotionIcon,
        },
        {
            id: 'clickup',
            name: 'ClickUp',
            description: 'Manage tasks and projects',
            icon: ClickUpLogo,
        },
    ];

    const handleConnectClick = (providerId: string) => {
        if (!teamId) {
            alert("Team information not available. Please complete the setup process first.");
            // Redirect to setup page to complete team setup
            window.location.href = "/setup";
            return;
        }
        setIsConnecting(providerId);
        window.location.href = `/api/integrations/${providerId}/connect?teamId=${teamId}`;
    };

    const isConnected = (providerId: string): boolean => {
        const integration = teamData?.integrations?.[providerId as keyof NonNullable<TeamData['integrations']>];
        return integration ? integration.connected : false;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Integrations</h2>
            <p className="text-gray-500 mb-6">Connect your favorite apps to streamline your workflow.</p>
            <ul className="space-y-4">
                {integrations.map((integration) => {
                    const Icon = integration.icon;
                    const connected = isConnected(integration.id);
                    const connecting = isConnecting === integration.id;

                    return (
                        <li key={integration.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 border border-gray-200 rounded-md">
                                    <Icon />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{integration.name}</p>
                                    <p className="text-sm text-gray-500">{integration.description}</p>
                                </div>
                            </div>
                            {connected ? (
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <CheckCircle className="w-4 h-4"/>
                                        Connected
                                    </span>
                                    <button
                                        onClick={() => onDisconnectIntegration(integration.id)}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleConnectClick(integration.id)}
                                    disabled={connecting}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50"
                                >
                                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                                    <span>{connecting ? "Redirecting..." : "Connect"}</span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const DangerZone = () => (
    <div className="mt-8 bg-white border border-red-300 rounded-lg p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
                <p className="font-semibold text-gray-800">Delete Your Account</p>
                <p className="text-gray-500 text-sm mt-1">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button className="mt-4 sm:mt-0 flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-bold py-2 px-4 rounded-md transition-colors border border-red-300">
                <Trash2 className="w-4 h-4" />
                Delete Account
            </button>
        </div>
    </div>
);


export default function SettingsPage() {
    const { user: firebaseUser, userData, loading: authLoading } = useAuth();
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [loading, setLoading] = useState(true);

    // Combine Firebase user with Firestore data
    const user: UserProfile | null = useMemo(() => {
        if (!firebaseUser || !userData) return null;
        return { ...firebaseUser, ...userData };
    }, [firebaseUser, userData]);

    useEffect(() => {
        // Fetch team data and integrations in parallel once user is available
        const fetchTeamData = async () => {
            if (!userData?.teamId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch team data and integrations in parallel
                const [teamDoc, integrationsSnapshot] = await Promise.all([
                    getDoc(doc(db, "teams", userData.teamId)),
                    getDocs(collection(db, "teams", userData.teamId, "integrations"))
                ]);

                const integrations: Record<string, Integration> = {};
                integrationsSnapshot.forEach((doc) => {
                    integrations[doc.id] = doc.data() as Integration;
                });

                if (teamDoc.exists()) {
                    setTeamData({ ...teamDoc.data(), integrations });
                } else {
                    setTeamData({ integrations });
                }
            } catch (error) {
                console.error("Error fetching team data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchTeamData();
        }
    }, [userData?.teamId, authLoading]);

    const handleDisconnectIntegration = async (provider: string) => {
        if (!user?.teamId) return;

        console.log(`Disconnecting ${provider}...`);
        const teamDocRef = doc(db, "teams", user.teamId);

        // Use the sub-collection path for integrations
        const integrationDocRef = doc(db, "teams", user.teamId, "integrations", provider);
        await setDoc(integrationDocRef, {
            connected: false,
            disconnectedAt: new Date(),
        }, { merge: true });

        // Also update the local state
        setTeamData(prev => {
            if (!prev) return null;
            const newIntegrations = { ...prev.integrations };
            delete newIntegrations[provider as keyof TeamData['integrations']];
            return { ...prev, integrations: newIntegrations };
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account, and integrations.</p>
                </header>
                <main className="max-w-3xl mx-auto space-y-8">
                    <ProfileSettings user={user} />
                    <SecuritySettings />
                    <Integrations teamId={user?.teamId || null} teamData={teamData} onDisconnectIntegration={handleDisconnectIntegration}/>
                    <DangerZone />
                </main>
            </div>
        </div>
    );
}

