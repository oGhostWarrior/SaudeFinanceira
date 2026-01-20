"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Key,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  Lock,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-medium text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsView() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    budgetAlerts: true,
    weeklyReport: true,
    investmentUpdates: false,
    billReminders: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: true,
  });

  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SettingsSection
            title="Profile Information"
            description="Manage your personal details"
          >
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Alex Johnson</p>
                <p className="text-sm text-muted-foreground">alex.johnson@email.com</p>
              </div>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Alex" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Johnson" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="alex.johnson@email.com"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" className="bg-secondary" />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            description="Configure how you receive alerts and updates"
          >
            <SettingRow
              label="Email Notifications"
              description="Receive updates via email"
            >
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Push Notifications"
              description="Receive push notifications on your device"
            >
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Budget Alerts"
              description="Get notified when approaching budget limits"
            >
              <Switch
                checked={notifications.budgetAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, budgetAlerts: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Weekly Summary Report"
              description="Receive a weekly financial summary"
            >
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReport: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Investment Updates"
              description="Get notified about significant portfolio changes"
            >
              <Switch
                checked={notifications.investmentUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, investmentUpdates: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Bill Reminders"
              description="Reminders before due dates"
            >
              <Switch
                checked={notifications.billReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, billReminders: checked })
                }
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            title="Security"
            description="Protect your account with enhanced security"
          >
            <SettingRow
              label="Two-Factor Authentication"
              description="Add an extra layer of security"
            >
              <Switch
                checked={security.twoFactor}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, twoFactor: checked })
                }
              />
            </SettingRow>

            <SettingRow
              label="Biometric Login"
              description="Use fingerprint or face recognition"
            >
              <Switch
                checked={security.biometric}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, biometric: checked })
                }
              />
            </SettingRow>

            <div className="pt-4 border-t border-border">
              <Label htmlFor="currentPassword">Change Password</Label>
              <div className="relative mt-2">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  className="bg-secondary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Input
                type="password"
                placeholder="New password"
                className="bg-secondary mt-2"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-secondary mt-2"
              />
              <Button variant="outline" className="mt-3 bg-transparent">
                Update Password
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Data Management"
            description="Export, import, or delete your financial data"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-left">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download as CSV or JSON</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-left">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Import Data</p>
                  <p className="text-xs text-muted-foreground">Import from other apps</p>
                </div>
              </button>
            </div>

            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Delete All Data</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permanently delete all your financial data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-3">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          <SettingsSection
            title="Preferences"
            description="Customize your experience"
          >
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Dark</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Privacy"
            description="Control your data visibility"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <Check className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Data Encrypted</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is encrypted at rest and in transit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Local Storage</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is stored locally on your device
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Quick Links"
            description="Help and support resources"
          >
            <div className="space-y-2">
              {[
                { label: "Help Center", icon: Globe },
                { label: "Privacy Policy", icon: Shield },
                { label: "Terms of Service", icon: Key },
                { label: "Contact Support", icon: Mail },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
