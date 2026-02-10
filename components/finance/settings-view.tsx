"use client";

import React, { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-finance-data";
import { updateProfile } from "@/lib/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, User, Globe, Wallet } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useLanguage } from "@/components/providers/language-provider";
import { Language } from "@/lib/translations";

export function SettingsView() {
  const { data: profile, isLoading } = useProfile();
  const { t, setLanguage } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    currency: "BRL",
    language: "pt-BR" as Language,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        currency: profile.currency || "BRL",
        language: (profile.language as Language) || "pt-BR",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        currency: formData.currency,
        language: formData.language,
      });

      await mutate("profile");
      await mutate("financial-summary");

      setLanguage(formData.language);
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      toast.error(t("settings.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("settings.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.cardTitle")}</CardTitle>
            <CardDescription>
              {t("settings.cardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {t("settings.fullName")}
              </Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={t("settings.fullNamePlaceholder")}
              />
            </div>

            {/* Moeda */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                {t("settings.currency")}
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.currencyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[0.8rem] text-muted-foreground">
                {t("settings.currencyDesc")}
              </p>
            </div>

            {/* Idioma */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {t("settings.language")}
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value as Language })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.languagePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (United States)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[0.8rem] text-muted-foreground">
                {t("settings.languageDesc")}
              </p>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("settings.saveButton")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}