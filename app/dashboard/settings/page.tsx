"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type ConnectionUser = {
  id: string
  name: string | null
  email: string
}

type ProfileUser = {
  id: string
  name: string | null
  email: string
  bio: string | null
  notifications: {
    email: boolean
    push: boolean
    reminders: boolean
    partnerActivity: boolean
  }
  partner: ConnectionUser | null
}

type SearchUser = {
  id: string
  name: string | null
  email: string
}

type IncomingInvitation = {
  id: string
  createdAt: string
  user: ConnectionUser
}

type OutgoingInvitation = {
  id: string
  createdAt: string
  partner: ConnectionUser
}

function displayName(name: string | null | undefined, email: string) {
  if (name && name.trim().length > 0) return name.trim()
  return email.split("@")[0]
}

function initials(name: string | null | undefined, email: string) {
  const safe = displayName(name, email)
  const parts = safe.split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export default function SettingsPage() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingInvitations, setUpdatingInvitations] = useState(false)

  const [partnerQuery, setPartnerQuery] = useState("")
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])

  const [incomingInvitations, setIncomingInvitations] = useState<IncomingInvitation[]>([])
  const [outgoingInvitations, setOutgoingInvitations] = useState<OutgoingInvitation[]>([])

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const { toast } = useToast()

  const canSearchUsers = useMemo(() => partnerQuery.trim().length >= 2, [partnerQuery])

  useEffect(() => {
    void loadInitialData()
  }, [])

  useEffect(() => {
    if (!canSearchUsers) {
      setSearchResults([])
      return
    }

    let active = true
    setSearchingUsers(true)

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/search?q=${encodeURIComponent(partnerQuery.trim())}`)
        if (!response.ok) {
          throw new Error("Failed to search users")
        }
        const data = (await response.json()) as SearchUser[]
        if (active) {
          setSearchResults(data)
        }
      } catch {
        if (active) {
          setSearchResults([])
        }
      } finally {
        if (active) {
          setSearchingUsers(false)
        }
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [partnerQuery, canSearchUsers])

  async function loadInitialData() {
    setLoading(true)
    try {
      await Promise.all([fetchUserData(), fetchInvitations()])
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserData() {
    try {
      const response = await fetch("/api/user/profile")
      if (!response.ok) {
        throw new Error("Failed to load user data")
      }
      const userData = (await response.json()) as ProfileUser
      setUser(userData)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    }
  }

  async function fetchInvitations() {
    try {
      const response = await fetch("/api/user/partner/invitations")
      if (!response.ok) {
        throw new Error("Failed to load invitations")
      }
      const payload = (await response.json()) as {
        incoming: IncomingInvitation[]
        outgoing: OutgoingInvitation[]
      }
      setIncomingInvitations(payload.incoming ?? [])
      setOutgoingInvitations(payload.outgoing ?? [])
    } catch {
      setIncomingInvitations([])
      setOutgoingInvitations([])
    }
  }

  async function updateProfile() {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          bio: user.bio,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      toast({ title: "Success", description: "Profile updated successfully" })
      await fetchUserData()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function updateNotifications() {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user.notifications),
      })

      if (!response.ok) {
        throw new Error("Failed to update notifications")
      }

      toast({ title: "Success", description: "Notification preferences updated" })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function invitePartner(input: { userId?: string; email?: string }) {
    setSaving(true)
    try {
      const response = await fetch("/api/user/partner/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send invitation")
      }

      toast({ title: "Success", description: "Invitation sent" })
      setPartnerQuery("")
      setSearchResults([])
      await fetchInvitations()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send invitation"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function approveInvitation(id: string) {
    setUpdatingInvitations(true)
    try {
      const response = await fetch(`/api/user/partner/invitations/${id}/accept`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to accept invitation")
      }
      toast({ title: "Success", description: "Invitation accepted" })
      await Promise.all([fetchUserData(), fetchInvitations()])
    } catch {
      toast({ title: "Error", description: "Failed to accept invitation", variant: "destructive" })
    } finally {
      setUpdatingInvitations(false)
    }
  }

  async function declineInvitation(id: string) {
    setUpdatingInvitations(true)
    try {
      const response = await fetch(`/api/user/partner/invitations/${id}/decline`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to decline invitation")
      }
      toast({ title: "Success", description: "Invitation declined" })
      await fetchInvitations()
    } catch {
      toast({ title: "Error", description: "Failed to decline invitation", variant: "destructive" })
    } finally {
      setUpdatingInvitations(false)
    }
  }

  async function disconnectPartner() {
    setSaving(true)
    try {
      const response = await fetch("/api/user/partner/disconnect", { method: "POST" })

      if (!response.ok) {
        throw new Error("Failed to disconnect partner")
      }

      toast({ title: "Success", description: "Partner disconnected" })
      await Promise.all([fetchUserData(), fetchInvitations()])
    } catch {
      toast({ title: "Error", description: "Failed to disconnect partner", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword() {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      setPasswords({ current: "", new: "", confirm: "" })
      toast({ title: "Success", description: "Password updated successfully" })
    } catch {
      toast({ title: "Error", description: "Failed to update password", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p>Failed to load user data. Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={user.name ?? ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={user.bio ?? ""}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={updateProfile} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card id="relationship-invites">
            <CardHeader>
              <CardTitle>Partner Connection</CardTitle>
              <CardDescription>
                Search by name or email, send an invite in one click, and manage approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {user.partner ? (
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(user.partner.name, user.partner.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName(user.partner.name, user.partner.email)}</p>
                        <p className="text-sm text-muted-foreground">{user.partner.email}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={disconnectPartner} disabled={saving}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="partner-search">Find partner by name or email</Label>
                <Input
                  id="partner-search"
                  placeholder="Type a name or email"
                  value={partnerQuery}
                  onChange={(e) => setPartnerQuery(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We only show results after you search. No full user list is exposed.
                </p>
              </div>

              {searchingUsers ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching users...
                </div>
              ) : null}

              {canSearchUsers && searchResults.length > 0 ? (
                <div className="space-y-2 rounded-md border p-3">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between gap-3 rounded-sm border p-2">
                      <div>
                        <p className="font-medium">{displayName(result.name, result.email)}</p>
                        <p className="text-xs text-muted-foreground">{result.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => invitePartner({ userId: result.id })}
                        disabled={saving || updatingInvitations}
                      >
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

              {partnerQuery.includes("@") ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => invitePartner({ email: partnerQuery.trim() })}
                    disabled={saving || updatingInvitations}
                  >
                    Invite this email
                  </Button>
                  <p className="text-xs text-muted-foreground">Works even if no search result is shown.</p>
                </div>
              ) : null}

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Incoming invitations</h3>
                {incomingInvitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending invitations.</p>
                ) : (
                  <div className="space-y-2">
                    {incomingInvitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div>
                          <p className="font-medium">{displayName(inv.user.name, inv.user.email)}</p>
                          <p className="text-xs text-muted-foreground">{inv.user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveInvitation(inv.id)}
                            disabled={updatingInvitations || saving}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => declineInvitation(inv.id)}
                            disabled={updatingInvitations || saving}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Outgoing invitations</h3>
                {outgoingInvitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No outgoing invites.</p>
                ) : (
                  <div className="space-y-2">
                    {outgoingInvitations.map((inv) => (
                      <div key={inv.id} className="rounded-md border p-3">
                        <p className="font-medium">{displayName(inv.partner.name, inv.partner.email)}</p>
                        <p className="text-xs text-muted-foreground">Pending approval: {inv.partner.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications about updates</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={user.notifications.email}
                  onCheckedChange={(checked) =>
                    setUser({
                      ...user,
                      notifications: { ...user.notifications, email: checked },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={user.notifications.push}
                  onCheckedChange={(checked) =>
                    setUser({
                      ...user,
                      notifications: { ...user.notifications, push: checked },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-reminders">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminders for upcoming events</p>
                </div>
                <Switch
                  id="event-reminders"
                  checked={user.notifications.reminders}
                  onCheckedChange={(checked) =>
                    setUser({
                      ...user,
                      notifications: { ...user.notifications, reminders: checked },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="partner-activity">Partner Activity</Label>
                  <p className="text-sm text-muted-foreground">Get notified when your partner adds new content</p>
                </div>
                <Switch
                  id="partner-activity"
                  checked={user.notifications.partnerActivity}
                  onCheckedChange={(checked) =>
                    setUser({
                      ...user,
                      notifications: { ...user.notifications, partnerActivity: checked },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={updateNotifications} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <Button onClick={updatePassword} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
