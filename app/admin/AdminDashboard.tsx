'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Database, 
  MessageSquare, 
  Heart, 
  Gift, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  Calendar,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { 
  getAdminUsers, 
  createAdminUser, 
  resetUserPassword, 
  deleteUser, 
  getPageSecurities, 
  savePageSecurity, 
  removePageSecurity, 
  getSystemMetrics 
} from '@/lib/actions/admin';
import { signOutAction } from '@/lib/actions/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [securities, setSecurities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    users: 0,
    relationships: 0,
    messages: 0,
    memories: 0,
    gifts: 0,
    securePages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Forms states
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [newSecurity, setNewSecurity] = useState({ pagePath: 'washington/hello-my-love-sarah', type: 'pin', value: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, securitiesData, metricsData] = await Promise.all([
        getAdminUsers(),
        getPageSecurities(),
        getSystemMetrics()
      ]);
      setUsers(usersData);
      setSecurities(securitiesData);
      setMetrics(metricsData);
    } catch (err) {
      toast.error('Failed to load admin data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
      toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      const res = await createAdminUser(newUser);
      if (res.success) {
        toast.success(`User account created successfully! Default password is "Passw0rd@1".`);
        setNewUser({ name: '', email: '', role: 'user' });
        loadData();
      } else {
        toast.error(res.error || 'Failed to create user');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to reset password for ${email}? It will reset to "Passw0rd@1".`)) return;

    try {
      const res = await resetUserPassword(userId);
      if (res.success) {
        toast.success(`Password reset successfully to "Passw0rd@1".`);
        loadData();
      } else {
        toast.error('Failed to reset password');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete account ${email}? This action is permanent.`)) return;

    try {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success('User deleted successfully');
        loadData();
      } else {
        toast.error(res.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecurity.pagePath || !newSecurity.value) return;

    try {
      const res = await savePageSecurity({
        pagePath: newSecurity.pagePath,
        type: newSecurity.type as 'pin' | 'password',
        value: newSecurity.value
      });

      if (res.success) {
        toast.success('Page protection configured successfully!');
        setNewSecurity({ pagePath: 'washington/hello-my-love-sarah', type: 'pin', value: '' });
        loadData();
      } else {
        toast.error(res.error || 'Failed to save security configuration');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleRemoveSecurity = async (id: string, path: string) => {
    if (!confirm(`Are you sure you want to remove passcode security from ${path}?`)) return;

    try {
      const res = await removePageSecurity(id);
      if (res.success) {
        toast.success('Page protection removed successfully');
        loadData();
      } else {
        toast.error('Failed to remove security config');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-sm text-gray-500 font-serif italic">Loading admin console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 pb-16">
      {/* Admin header */}
      <header className="border-b border-rose-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white font-serif font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-rose-950 font-serif">Admin Console</h1>
              <p className="text-xs text-gray-400">System management & security control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 cursor-pointer">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => signOutAction()}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-rose-950 font-serif">System Management</h2>
            <p className="text-gray-500 text-xs">Configure passwords, access locks, and monitor performance</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="border-rose-200 hover:bg-rose-50 text-rose-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-rose-50/50 p-1 border border-rose-100 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-rose-900 cursor-pointer">
              <Users className="w-4 h-4 mr-2 shrink-0" />
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-rose-900 cursor-pointer">
              <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
              Passcodes
            </TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-rose-900 cursor-pointer">
              <Activity className="w-4 h-4 mr-2 shrink-0" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <Card className="border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-fit">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-rose-950">Add User Account</CardTitle>
                  <CardDescription>Accounts are created with the default password "Passw0rd@1"</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. John Doe"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                        className="rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. johndoe@gmail.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        className="rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role">User Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                      >
                        <SelectTrigger className="rounded-xl border-gray-300 bg-white text-gray-900 focus:border-rose-400 focus:ring-rose-400">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User (Standard Couple)</SelectItem>
                          <SelectItem value="admin">Administrator (Control Console)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl py-3 cursor-pointer shadow-sm mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="lg:col-span-2 border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-rose-950">Active User Directory</CardTitle>
                  <CardDescription>Manage credentials and password changes</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-rose-100 text-gray-400 font-serif">
                        <th className="pb-3 pl-4">Name / Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-center">Pwd Status</th>
                        <th className="pb-3 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="font-semibold text-gray-800">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              u.role === 'admin' 
                                ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {u.needsPasswordChange ? (
                              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                                Needs Change
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
                                Ok
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right pr-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleResetPassword(u.id, u.email)}
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer"
                                title="Reset password to default 'Passw0rd@1'"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Delete user permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Passcodes Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <Card className="border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl h-fit">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-rose-950">Lock Page Path</CardTitle>
                  <CardDescription>Each page under /washington has its own passcode</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSecurity} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pagePath">Page Path</Label>
                      <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 rounded-l-xl text-gray-500 text-sm select-none">
                          /
                        </span>
                        <Input
                          id="pagePath"
                          placeholder="washington/hello-my-love-sarah"
                          value={newSecurity.pagePath}
                          onChange={(e) => setNewSecurity({ ...newSecurity, pagePath: e.target.value })}
                          required
                          className="rounded-r-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="secType">Passcode Type</Label>
                      <Select
                        value={newSecurity.type}
                        onValueChange={(val) => setNewSecurity({ ...newSecurity, type: val })}
                      >
                        <SelectTrigger className="rounded-xl border-gray-300 bg-white text-gray-900 focus:border-rose-400 focus:ring-rose-400">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pin">4-Digit PIN (Numeric only)</SelectItem>
                          <SelectItem value="password">Text Password (Alphanumeric)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="secValue">Passcode Value</Label>
                      <Input
                        id="secValue"
                        placeholder={newSecurity.type === 'pin' ? 'e.g. 1234' : 'e.g. secret123'}
                        value={newSecurity.value}
                        onChange={(e) => setNewSecurity({ ...newSecurity, value: e.target.value })}
                        required
                        className="rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl py-3 cursor-pointer shadow-sm mt-2"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Apply Lock
                  </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List */}
              <Card className="lg:col-span-2 border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-rose-950">Active Path Protection</CardTitle>
                  <CardDescription>Locked paths requiring individual passcodes</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 overflow-x-auto">
                  {securities.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-serif italic">
                      No page security locks configured yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-rose-100 text-gray-400 font-serif">
                          <th className="pb-3 pl-4">Target Page Path</th>
                          <th className="pb-3">Verification Type</th>
                          <th className="pb-3">Active Code</th>
                          <th className="pb-3 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securities.map((s) => (
                          <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pl-4 font-semibold text-gray-800 font-mono">
                              {s.pagePath}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                s.pin 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                  : 'bg-purple-50 text-purple-700 border border-purple-100'
                              }`}>
                                {s.pin ? '4-Digit PIN' : 'Password'}
                              </span>
                            </td>
                            <td className="py-4 font-mono text-gray-600 font-semibold">
                              {s.pin ? s.pin : s.password}
                            </td>
                            <td className="py-4 text-right pr-4">
                              <Button
                                onClick={() => handleRemoveSecurity(s.id, s.pagePath)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Unlock Page"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <MetricCard title="System Users" value={metrics.users} icon={<Users className="w-5 h-5 text-blue-500" />} />
              <MetricCard title="Active Relationships" value={metrics.relationships} icon={<Heart className="w-5 h-5 text-red-500" />} />
              <MetricCard title="Total Messages" value={metrics.messages} icon={<MessageSquare className="w-5 h-5 text-green-500" />} />
              <MetricCard title="Memories Logged" value={metrics.memories} icon={<Calendar className="w-5 h-5 text-amber-500" />} />
              <MetricCard title="Gifts Shared" value={metrics.gifts} icon={<Gift className="w-5 h-5 text-purple-500" />} />
              <MetricCard title="Protected Routes" value={metrics.securePages} icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />} />
            </div>

            <Card className="border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl p-6">
              <h3 className="font-serif text-lg font-bold text-rose-950 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" /> Database Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">Connection Engine</span>
                    <p className="text-xs text-gray-400 mt-0.5">PrismaClient ORM</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full">
                    Healthy
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">WebSocket Dispatcher</span>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time Presence System</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full">
                    Running
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="border-rose-100 bg-white/70 backdrop-blur-sm shadow-md rounded-xl transition-transform duration-300 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-serif">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-serif text-rose-950 mt-1">{value}</div>
      </CardContent>
    </Card>
  );
};
